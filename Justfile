help:
	just --list --unsorted

@test:
	pnpm jest --clearCache > /dev/null
	pnpm jest

format:
	pnpm prettier --write .

type-check:
	pnpm tsc --noEmit

build:
	pnpm tsc --noEmit

cli cmd="dump":
	npx ts-node src/index.ts {{cmd}}
