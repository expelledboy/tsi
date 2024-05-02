test:
	pnpm jest

format:
	pnpm prettier --write .

build:
	pnpm tsc --noEmit
