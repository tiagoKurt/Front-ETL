echo "GERAR IMAGENS FRONTETL $1"
echo FRONTETL
docker build -t etlmongodb-frontend:$1 .