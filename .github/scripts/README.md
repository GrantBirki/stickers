# Pages builds

The build job intentionally runs the selected commit's complete toolchain, including its Node version, manifest, lockfile, install hooks, build scripts, configuration, imported helpers, and components. It uses a fresh hosted runner with only repository-read permissions, no deployment secrets or OIDC access, no saved checkout credentials, and no Actions cache access. Tooling changes are tested in that same job. The runner still has the artifact service access needed to upload its build.

A separate read-only job loads packaging code from the exact workflow commit and treats the build archive as untrusted static files. It rejects links, special files, duplicate paths, and paths outside the output directory. Artifacts are selected within the current run by the selected commit and attempt. Packaging writes `version.txt` from that selected commit and `workflow-version.txt` from the trusted workflow commit. Publishing runs in another job and never executes the generated site.

A noop builds and validates without publishing; result mode reports the required jobs' actual outcomes and handles the original deployment context and lock. Run the packaging checks without installing dependencies: `python3 -m unittest discover -s .github/scripts -p "test_*.py"`.

The packaging job enables Fence's bounded GitHub artifact access for its download and upload steps. Other jobs keep their existing network policy.
