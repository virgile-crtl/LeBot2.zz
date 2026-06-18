```bash
docker compose --profile coverage up
docker cp $(docker compose ps -a -q test-coverage):/lebot2.zz/coverage ./coverage
```