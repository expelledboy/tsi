test:
	pnpm jest

test-reset:
	pnpm jest --clearCache

format:
	pnpm prettier --write .

build:
	pnpm tsc --noEmit

cli cmd="dump":
	npx ts-node src/index.ts {{cmd}}
