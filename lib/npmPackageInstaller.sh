#!/bin/bash

# Walter - NPM package installer
#
# Asks if a 'npm init' is required and runs it if needed.
# Installs all NPM packages in the packages.txt file.


cwd="$(pwd)"
packagesList="${cwd}/lib/packages.txt"


cd "${cwd}/${1}"


read -p "Is this project require a package.json file? [yes]" initRequirement
initRequirement=${initRequirement:-yes}

while [[ ${initRequirement} != "y" ]] && [[ ${initRequirement} != "n" ]] && [[ ${initRequirement} != "yes" ]] && [[ ${initRequirement} != "no" ]]
do
    read -p "Please answer with 'yes'/'y' (default) or 'no'/'n'" initRequirement
done

if [[ ${initRequirement} == "yes" || ${initRequirement} == "y" ]]; then
    npm init
fi

while IFS= read -r line
do
    npm install --save ${line}
done < "$packagesList"

cd ${cwd}