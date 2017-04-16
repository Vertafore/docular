@doc overview
@id index
@name DocTypes Intro
@description

# Documentation Types (DocTypes)

Things to know about ``docTypes``.

1. ``DocTypes`` are what Docular uses to determine how to render the document.

2. ``DocTypes`` are the value specified next to the ``documentation identifier``.

```js
/**
 * &#64;ngdoc directive
 */
```

So in the above example "@ngdoc" is the ``documentation identifier`` and "directive" is the ``docType``.  And this would be like saying hey "@ngdoc" plugin, I want you to render this document as a "directive". Then the "@ngdoc" plugin would say, "Dude, no problem, I'm on it."

### DocTypes Need Params to Render

So just because you said "Yo! Render a service for me." doesn't mean the plugin will be able to. You may need to provide some mandatory and/or optional parameters by giving it the proper "@&lt;key&gt;" value pairs. Check out the next two sections to see the types of params expected for each docType.

<page-list></page-list>

@doc overview
@id types_doc
@name @doc DocTypes
@description

## &#64;doc DocTypes are the Default DocTypes

`@doc` documentation plugin contain the default docTypes that all plugins inherit from. Unless they are overriden, they will be available for every documentation plugin.

## DocTypes

<ul class="properties">
    <li>
        <h3 id="annotate">@doc overview ( {@link docularinstall/installnode example} ) </h3>
        <div class="annotate">
            <p>The ``overview`` docType is meant to simply render whatever is within the "@description". Note, this page was rendered as an overview.</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>
        </div>
    </li>
</ul>

<ul class="properties">
    <li>
        <h3 id="annotate">@doc module ( {@link docular/docular example} ) </h3>
        <div class="annotate">
            <p>The ``module`` docType generates a bit of a 'splash' page where you can talk generally about the module. It will print out the "@name" attribute which should match the "@id" of the module. You can then use the "@description" to provide more information and quick links.</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>
        </div>
    </li>
</ul>

<ul class="properties">
    <li>
        <h3 id="annotate">@doc function ( {@link /documentation/example/doctypes/doctypes_doc.class:doc_function example} )</h3>
        <div class="annotate">
            <p>The ``function`` docType is used as a single function or method</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
            </ul>

            <h3>Optional Params</h3>
            <ul class="parameters">
                <li>
                    ``returns``:
                    <pre>@returns {<type>} <description of return value></pre>
                </li>
                <li>
                    ``param`` : Provide one param for each param that the function accepts
                    <pre>@param {<type>} <description of param></pre>
                </li>
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>

        </div>
    </li>
</ul>

<ul class="properties">
    <li>
        <h3 id="annotate">@doc method ( {@link /documentation/example/doctypes/doctypes_doc.class:doc_method example} )</h3>
        <div class="annotate">
            <p>SEE `@doc function`</p>
        </div>
    </li>
</ul>

<ul class="properties">
    <li>
        <h3 id="annotate">@doc interface ( {@link /documentation/example/doctypes/doctypes_doc.class:doc_interface example} )</h3>
        <div class="annotate">
            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
            </ul>

            <h3>Optional Params</h3>
            <ul class="parameters">
                <li>
                    ``property`` : Provide as many as necessary
                    <pre>@property {<type>} <property name> <description> <id></pre>
                </li>
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>
        </div>
    </li>
</ul>

<ul class="properties">
    <li>
        <h3 id="annotate">@doc object ( {@link /documentation/example/doctypes/doctypes_doc.class:doc_object example} )</h3>
        <div class="annotate">
            <p>SEE `@doc interface`</p>
        </div>
    </li>
</ul>


<docular-pager></docular-pager>

@doc overview
@id types_ngdoc
@name @ngdoc DocTypes
@description

The `@ngdoc` documentation plugin inherits all docTypes from the default `@doc` documentation plugin and adds in the following docTypes. Check out the 'expected', and 'optional' fields each docType expects and click 'example' to view a rendered example.

## DocTypes

<ul class="properties">
    <li>
        <h3 id="annotate">@ngdoc directive ( {@link /documentation/example/doctypes/doctypes_ngdoc.directive:directive_example example} ) </h3>
        <div class="annotate">
            <p>The ``directive`` docType provides an overview for the usage of an {@link /documentation/angular/guide/directive AngularJS directive}.</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
                <li>
                    ``element`` : Describes how this directive is used by specifying one of the following element types: "ANY", "ELEMENT, or "ATTRIBUTE".
                    <pre>@element <element type></pre>
                </li>
            </ul>

            <h3>Optional Parameters</h3>
            <ul class="parameters">
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
                <li>
                    ``example`` :
                    <pre>@example <multi-line markup parsed as an example object> </pre>
                    More documentation coming here. This may not be usable easily for third party code without a lot of effort.
                </li>
            </ul>
            <h3>Sample Doc</h3>
            <pre>
/**
 * &#64;ngdoc directive
 * &#64;name module.directive:sample
 * &#64;element ANY
 * &#64;description
 * This is a sample description.
 */
            </pre>
        </div>
    </li>

    <li>
        <h3 id="annotate">@ngdoc filter ( {@link /documentation/example/doctypes/doctypes_ngdoc.filter:filter_example example} ) </h3>
        <div class="annotate">
            <p>The ``filter`` docType provides an overview for the usage of an {@link /documentation/angular/guide/dev_guide.templates.filters AngularJS filter}.</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
            </ul>

            <h3>Optional Parameters</h3>
            <ul class="parameters">
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>
            <h3>Sample Doc</h3>
            <pre>
/**
 * &#64;ngdoc filter
 * &#64;name module.filter:sample
 * &#64;description
 * This is a sample description.
 */
            </pre>
        </div>
    </li>

    <li>
        <h3 id="annotate">@ngdoc service ( {@link /documentation/example/doctypes/doctypes_ngdoc.service:service_example example} ) </h3>
        <div class="annotate">
            <p>The ``service`` docType provides an overview for the usage of an {@link /documentation/angular/guide/dev_guide.services AngularJS service}.</p>

            <h3>Expected Params</h3>
            <ul class="parameters">
                <li>
                    ``id`` : Must be provided, or "@name" must be provided.
                    <pre>@id <id></pre>
                </li>
                <li>
                    ``name`` : Optional, unless "@id" is not provided. Value displays in menus and as the titles.
                    <pre>@name <name></pre>
                </li>
            </ul>

            <h3>Optional Parameters</h3>
            <ul class="parameters">
                <li>
                    ``description`` :
                    <pre>@description <multi-line description> </pre>
                </li>
            </ul>
            <h3>Sample Doc</h3>
            <pre>
/**
 * &#64;ngdoc service
 * &#64;name module.service:sample
 * &#64;description
 * This is a sample description.
 */
            </pre>
        </div>
    </li>

</ul>




<docular-pager></docular-pager>