Port of Beaker auction contract to TEALScript. Original source: https://github.com/algorand-devrel/beaker-auction/tree/7e1fe62b852c0d819954a931f10cf39d841cbc02 

# Install python dependencies

1. `python -m venv .venv` and `source .venv/bin/activate` to create a virtual environment to install python dependencies
2. `pip3 install -r requirements.txt` to install python dependencies


# Usage

## Python Tests (PyTest)

1. `source .venv/bin/activate` to activate virtual environment
2. `python auction.py` to generate beaker artifacts (`.teal`, `.json` files)
3. `npx tsx ../../src/bin/tealscript.ts auction.ts tealscript_artifacts` to generate tealscript artifacts
4. `pytest` to execute tests

