if [ -z "$1" ]
  then
    echo "No config file supplied Usage: setup-env-by-file.sh [configPath] [envFilePath]"
fi

if [ -z "$2" ]
  then
    echo "No .env file supplied Usage: setup-env-by-file.sh [configPath] [envFilePath]"
fi

echo 'Stopping old compose'
docker-compose -f "$1" rm -svf
echo 'Starting a new deployment'
docker-compose -f "$1" build
docker-compose -f "$1" --env-file "$2" up -d
echo 'Waiting for topic init'
docker wait kafka-init-topics