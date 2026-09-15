# Sphinx configuration for the standalone documentation preview.
# When this training is integrated into plone/training, that project's
# conf.py takes over and this file is not needed.
project = "Blicca JS stack insights"
author = "Peter Mathis, Johannes Raggam"
copyright = "Plone Foundation"

extensions = [
    "myst_parser",
    "sphinx.ext.intersphinx",
    "sphinx_copybutton",
    "sphinx_design",
]

myst_enable_extensions = [
    "attrs_block",
    "attrs_inline",
    "colon_fence",
    "deflist",
    "html_image",
    "linkify",
    "strikethrough",
    "substitution",
]

intersphinx_mapping = {
    "plone": ("https://6.docs.plone.org/", None),
    "training": ("https://training.plone.org/", None),
}

exclude_patterns = ["_build", "requirements.txt"]

html_theme = "plone_sphinx_theme"
html_title = "Blicca JS stack insights"
html_theme_options = {
    "path_to_docs": "docs",
    "repository_branch": "main",
    "repository_url": "https://github.com/collective/blicca.staticresourceoverride",
    "use_edit_page_button": True,
    "use_issues_button": True,
    "use_repository_button": True,
}

suppress_warnings = ["myst.strikethrough"]
