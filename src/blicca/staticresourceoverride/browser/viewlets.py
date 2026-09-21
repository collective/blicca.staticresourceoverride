from plone.app.layout.viewlets.common import ViewletBase


class CodeSnippetViewlet(ViewletBase):
    """Show the code snippet of the behavior below the content body.

    Registered for the behavior schema, which doubles as its marker
    interface, and for the default view only (IViewView), see configure.zcml.
    The template renders a <pre> block with the pat-syntax-highlight trigger:
    a Patternslib pattern that the Plone bundle does not register — the
    add-on bundle imports it (resources/overrides.js). Without the bundle it
    degrades to a plain, escaped <pre> block.
    """

    def update(self):
        super().update()
        self.code_snippet = (getattr(self.context, "code_snippet", None) or "").strip()

    def render(self):
        if not self.code_snippet:
            return ""
        return self.index()
