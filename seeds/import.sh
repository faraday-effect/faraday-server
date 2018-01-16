#!/usr/bin/env bash

# Import JSON content into MongoDB.

for c in courses listings offerings quizzes roles semesters topics users
do
    echo ===== ${c} =====
    mongo --quiet faraday --eval "db.$c.drop()"
    mongoimport --quiet --db=faraday --collection=${c} --jsonArray --file=${c}.json
done
