# Docker

## Coverage and Test

If you want to run the tests and generate the coverage report and test results, you can use the following commands:

```bash
docker compose --profile coverage up
docker cp $(docker compose ps -a -q test-coverage):/lebot2.zz/coverage ./coverage
docker cp $(docker compose ps -a -q test-results):/lebot2.zz/test-results ./test-results
```