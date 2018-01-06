#!/usr/bin/env bash

mongoimport --db=faraday --collection=cells --file=cells.json 
mongoimport --db=faraday --collection=quizzes --file=quizzes.json 
