#!/usr/bin/env bash

#----------------------------------------------------------------------
# Shows the 10 files from fasd (https://github.com/clvv/fasd) with
# the highest score and opens a file on click.
#
# Argos compatible
#----------------------------------------------------------------------

echo "| iconName=document-open-recent"
echo "-----"

for i in $(fasd -fl | tail -10 ); do
				echo "$i | bash='xdg-open \"$i\"' terminal=false"
done
