{
  description = "Vent-Tools: Angular v20+ Hermetic Development Environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    opencode.url = "github:anomalyco/opencode";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      opencode,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # 1. Get the base package
        opencodeBase = opencode.packages.${system}.default;

        # 2. Create a patched version that ignores the Bun version mismatch
        opencodePatched = opencodeBase.overrideAttrs (oldAttrs: {
          # append to the existing patch phase
          postPatch = (oldAttrs.postPatch or "") + ''
            # Use sed to replace the strict version check condition with 'false'
            # This turns "if (version != expected) ..." into "if (false) ..."
            sed -i 's/process.versions.bun !== expectedBunVersion/false/' packages/script/src/index.ts
          '';
        });

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            corepack
            awscli2

            # 3. Use the patched package
            opencodePatched
          ];

          shellHook = ''
            echo "Environment loaded."
            opencode --version
          '';
        };
      }
    );
}
