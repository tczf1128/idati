#!/bin/sh

set -e

go build -o idati && cd fe_source && sh webbuild.sh
