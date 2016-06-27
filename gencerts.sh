
#!/bin/bash

set -e

if [ "$#" -ne 3 ] && [ "$#" -ne 4 ]; then 
    echo "Usage: $0 CA NAME ORG"
    echo "CA - name of fake CA"
    echo "NAME - name of fake client"
    echo "ORG - organisation for both"
    echo "[DIR] - directory for cert output"
    exit
fi

CA=$1
NAME=$2
ORG=$3

if [ -z "$4" ]; then
    DIR=./
else
    DIR=$4
fi

if [ ! -d "$DIR" ]; then
    mkdir -p $DIR
fi

LENGTH=4096
DAYS=1000

SUBJECT='/C=NZ/ST=AKL/L=Auckland/O='$ORG'/CN='$NAME

echo Generating CA
openssl genrsa -out $DIR/$CA.key $LENGTH

echo Signing CA
openssl req -x509 -new -nodes -key $DIR/$CA.key -sha256 -days 1024 -out $DIR/$CA.crt -subj $SUBJECT

echo Generating keys
openssl genrsa -out $DIR/$NAME.key $LENGTH

echo Generating CSR
openssl req -new -out $DIR/$NAME.csr -key $DIR/$NAME.key -subj $SUBJECT

echo Signing cert
openssl x509 -req -days $DAYS -in $DIR/$NAME.csr -out $DIR/$NAME.crt -CA $DIR/$CA.crt -CAkey $DIR/$CA.key -CAcreateserial

echo Done