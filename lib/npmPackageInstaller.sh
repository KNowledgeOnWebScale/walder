#!/bin/bash

input="./packages.txt"

read -p "Is this project require a package.json file? (yes)" initRequirement

while [initRequirement != "" && initRequirement != "y" && initRequirement != "n" && initRequirement != "yes" && initRequirement != "no"]
do
    read -p "Please answer with 'yes'/'y' (default) or 'no'/'n'" initRequirement
done

if [initRequirement == "" || initRequirement == "yes" || initRequirement == "y"]; then
    npm init
fi


while IFS= read -r line
do
    npm i --save "$line"
done < "$input"
