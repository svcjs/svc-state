#!/bin/bash

postfix=$1

if [ $postfix"x" == "x" ];then
    echo "testing main by package.json"
else
    echo "testing $postfix"
fi

cp -rf test test-dist
for file in `cd test && ls *.js`
do
    sed "s#from '../src/index'#from '../$postfix'#" test/$file > test-dist/$file
done

./node_modules/.bin/ava test-dist/*.js

if [ $2"x" == "x" ];then
    rm -rf test-dist
fi
