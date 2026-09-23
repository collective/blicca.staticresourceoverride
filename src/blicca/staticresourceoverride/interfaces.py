from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBliccaStaticResourceOverrideLayer(IDefaultBrowserLayer):
    """Marker interface for the browser layer of this add-on.

    Registered via profiles/default/browserlayer.xml, so the template
    overrides in browser/ are only active once the add-on is installed.
    """
