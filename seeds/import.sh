#!/usr/bin/env bash

# Import JSON content into MongoDB.

function status () {
    echo "      [$1] $2"
}

function banner () {
    echo "====== $1 ======"
}

for file in ./*.json
do
    c=$(basename ${file} .json)
    echo "== $c"
    output=$(mongo --quiet faraday --eval "db.$c.drop()")
    if [[ $output = "true" ]]
    then
        status "mongo" "dropped $c"
    else
        status "mongo" "failed to drop $c; continuing"
    fi

    output=$(mongoimport --quiet --db=faraday --collection=${c} --jsonArray --file=${file})
    if [[ $? == 0 ]]
    then
        status "mongoimport" "imported $c"
    else
        status "mongoimport" "failed to import $c"
        banner "FAILURE"
        exit 1
    fi
done

banner "COMPLETE"
exit 0
