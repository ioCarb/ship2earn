#!/bin/bash

logfile="command_log.log"
exec 3>&1 4>&2 1>>${logfile} 2>&1

function monitor_cpu_mem {
    pid=$1
    label=$2

    echo "Parent PID: $pid" | tee /dev/fd/3
    count=0

    start_ms=$(($(date +%s%N)/1000000))
    total_cpu=0
    total_mem=0
    peak_cpu=0
    peak_mem=0

    num_cores=$(nproc)

    while ps -p $pid > /dev/null; do
        current_time=$(date +"%Y-%m-%d %H:%M:%S")

        # Get CPU and memory usage for the entire process tree
        ps_output=$(ps --forest -o pid,ppid,pgid,%cpu,%mem --ppid $pid --pid $pid --no-headers)

        total_cpu_usage=$(echo "$ps_output" | awk -v cores="$num_cores" '{cpu+=$4} END {print cpu / cores}')
        total_mem_usage=$(echo "$ps_output" | awk '{mem+=$5} END {print mem}')

        total_cpu=$(echo "$total_cpu + $total_cpu_usage" | bc)
        total_mem=$(echo "$total_mem + $total_mem_usage" | bc)

        if (( $(echo "$total_cpu_usage > $peak_cpu" | bc -l) )); then
            peak_cpu=$total_cpu_usage
        fi
        if (( $(echo "$total_mem_usage > $peak_mem" | bc -l) )); then
            peak_mem=$total_mem_usage
        fi

        # Format output to align CPU and memory usage
        printf "%s CPU: %7.2f%%, MEM: %6.2f%%, Observed PID: %d\n" "$current_time" "$total_cpu_usage" "$total_mem_usage" "$pid" | tee /dev/fd/3

        sleep 1
        count=$((count + 1))
    done

    end_ms=$(($(date +%s%N)/1000000))
    total_time_ms=$((end_ms - start_ms))
    avg_cpu=$(echo "scale=2; $total_cpu / $count" | bc)
    avg_mem=$(echo "scale=2; $total_mem / $count" | bc)
    echo "Total time: ${total_time_ms} milliseconds" | tee /dev/fd/3
    echo "Average CPU: ${avg_cpu}%" | tee /dev/fd/3
    echo "Peak CPU: ${peak_cpu}%" | tee /dev/fd/3
    echo "Average MEM: ${avg_mem}%" | tee /dev/fd/3
    echo "Peak MEM: ${peak_mem}%" | tee /dev/fd/3
}

function run_and_monitor {
    command=$1
    label=$2

    echo "Executing: $label" | tee /dev/fd/3
    echo "Command: $command" | tee /dev/fd/3
    start_time=$(date +%s%N)  # Capture start time in nanoseconds since epoch

    eval $command &
    pid=$!

    monitor_cpu_mem $pid "$label" &
    monitor_pid=$!

    wait $pid
    wait $monitor_pid

    end_time=$(date +%s%N)  # Capture end time in nanoseconds since epoch
    total_elapsed_ms=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

    # Print the results
    echo "Total time: ${total_elapsed_ms} milliseconds" | tee /dev/fd/3
    echo "--------------------------------------------------" | tee /dev/fd/3
}

run_and_monitor "zokrates compile -i root.zok" "Compile"
run_and_monitor "zokrates universal-setup --size 21 --proving-scheme marlin" "Universal Setup"
run_and_monitor "zokrates setup --proving-scheme marlin" "Setup"
INPUT_VALUES=$(cat input.txt | tr '\n' ' ')
run_and_monitor "zokrates compute-witness -a $INPUT_VALUES" "Compute Witness"
run_and_monitor "zokrates generate-proof --proving-scheme marlin" "Generate-Proof"
run_and_monitor "zokrates export-verifier" "Export-Verifier"
run_and_monitor "zokrates verify" "Verification"