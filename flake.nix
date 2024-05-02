{
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs-18_x;
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            bashInteractive
            just
            nodejs
            nodejs.pkgs.pnpm
          ];
        };
      }
    );
}
