# Contributing

You should only have to modify the files `_docs.md` and `_index.md`. If you're documenting a new feature, please do so in the branch:

    :::text
    gh-pages-dev

The branch `gh-pages` is for the latest stable version. The development branch will be merged on the main branch upon a new release.

# Compiling for production

Make sure Markdown ([python dist](http://freewisdom.org/projects/python-markdown/)) is installed with [codehilite](http://freewisdom.org/projects/python-markdown/CodeHilite). Then do a:

    ./compile    

That should generate all the necessary production files.
