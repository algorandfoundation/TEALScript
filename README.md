# TEALScript

TEALScript is a TypeScript compiler for generating TEAL. The goal is to enable developers to write Algorand Smart Contracts using native TypeScript syntax. Since TEALScript uses native TypeScript syntax, IDE support works out of the box for any IDE that supports TypeScript.

## Status

TEALScript is still very much a work in progress. The current version is `0.0.0`. This means there will be frequent changes being made without any changes to the version number, including breaking changes. As such, it is currently not recommended to use TEALScript for development. This repo is public to demonstrate the current progress being made, so feedback and PRs are welcome.

### TODOs

Before creating a tagged release and distributing via NPM there are a couple of things that need to be done

* Proper testing
* Basic documentation
* AVM feature completion

Regarding feature completion, the goal is to enable the usage of *most* fo the AVM opcodes avaiable to use in TEALScript at appropriate levels of abstraction.
