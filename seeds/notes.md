# Flask/Jinja Templates of Doom

Templates provide a convenient way to create an HTML page. Flask’s
`render_template` method takes the name of a template file and converts
it to a string that you can return from a view function.

## "Static" Templates

The following function returns the contents of the template file
`hello.html`.

hello.html

```
@app.route('/')
def hello_world():
    return render_template('hello.html')
```        

The `hello.html` file itself contains the following.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello</title>
</head>
<body>
    <h1>Hello, World</h1>
    <p>This is a Flask template.</p>
</body>
</html>
```

# Basic Templates

The previous example isn’t really a "template," 
in that it doesn't
provide any way to change the content of the page at run time. It’s
simply a static HTML file that’s rendered exactly as is.

Templates are more useful when they include dynamically generated
content from the Python view function. Consider the following template:

hello-name.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello</title>
</head>
<body>
    <h1>Hello, {{ name }}</h1>
    <p>This is a Flask template.</p>
</body>
</html>
```

In the `h1` tag, note the `{{ name }}` syntax. The double curly braces
enclose the name of a template variable whose value will be interpolated
into the HTML. That is, the entire sequence `{{ name }}` will be
replaced by the value of the `name` variable that is passed to the
template from the Python view function, as illustrated next.

```
@app.route('/name')
def hello_name():
    return render_template('hello-name.html', name='Fred Ziffle')
```

This view function renders the `hello-name.html` template and supplies
the string `'Fred Ziffle'` as the value of the `name` template variable.
The resulting `h1` element will be:

```
<h1>Hello, Fred Ziffle</h1>
```

# Iteration

The previous example used a template variable that was a simple string.
You can also pass more elaborate values into template variables. For
example, the following view function passes a list, each element of
which is a dictionary.

```
@app.route('/comments')
def comments():
    fake_comments = [ { 'who': 'wesley',
                        'what': 'As you wish!'},
                      { 'who': 'vincini',
                        'what': 'Inconceivable'} ]
    return render_template('comments.html', comments=fake_comments)
```

The template variable, `comments`, is passed to the template with this
list of dictionaries as a value. We want to iterate over the elements of
the list, rendering the same pattern of HTML for each list element.
Here’s a part of a template that renders the list of comments.

comments.html

```
<p>Here are some comments</p>
<ul>
{% for comment in comments %}
    <li><strong>{{ comment.who }}</strong>: {{ comment.what }}</li>
{% endfor %}
</ul>
```

In addition to the `{{ …​ }}` syntax that gets replaced by the value of
the expression inside, templates can contain other *directives*, like
the `for` directive in this example. Directives are enclosed in
`` {% …​ %}', and extend to a corresponding `{% end…​ %} `` directive.
The `comments.html` example shows a `for` directive. It will iterate
over the array passed to the template in the `comments` variable,
assigning each element in turn to the `comment` variable.

For each value of `comment`, the template renders all the markup between
the `{% for …​ %}` and the `{% endfor %}` (in this case, just the single
`li` element). Note that `comment` is set in turn to each of the
dictionaries in the original `comments` list. Through the `comment`
variable, the template has access to the entries in the underlying
dictionary. For example, `comment.who` retrieves the value stored under
the `who` key in the current dictionary. Using the `{{ …​ }}` syntax,
the template renders the values from the dictionary within the `li`
element.

Here is the resulting HTML:

```
<h1>Comments</h1>
<p>Here are some comments</p>
<ul>
    <li><strong>wesley</strong>: As you wish!</li>
    <li><strong>vincini</strong>: Inconceivable</li>
</ul>
```

# Template Inheritance

Many HTML pages in an application have the same basic format. Often
there will be a common heading (e.g., a top-level menu bar), common
footer (e.g., copyright inforation, common links), etc. It’s tempting to
duplicate this common code across multiple HTML pages. However, this
strategy creates problems with maintenance, making it difficult to
change multiple copies of the same markup consistently, etc. Duplication
is a violation of the "Don’t Repeat Yourself" (DRY) principle. It’s
better to create code or markup once and reuse it than it is to
duplicate it numerous times.

Templates allow you to extract common markup into a single HTML file and
then reuse that markup in multiple other pages. For example:

base.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}Default Title{% endblock %}</title>
</head>
<body>
    <h1>Heading from Base Template</h1>
    {% block content %}
        <p>Override this content!</p>
    {% endblock %}
</body>
</html>
```

This file contains two instances of the `{% block %}` directive. This
directive takes an arbitrary name, which identifies the block and
extends to the corresponding `{% endblock %}`. In `base.html`, the two
blocks are called `title` and `content`. When using this template, all
the markup outside of the `block` directives will be rendered exactly as
is.

The following markup *extends* that in `base.html` to:

- Reuse the markup in `base.html`
- Add page-specific content for the two `blocks` directives in `base.html`

```
{% extends "base.html" %}

{% block title %}Child Page One{% endblock %}

{% block content %}
<h2>Page One</h2>

<p>This is actual content.</p>
{% endblock %}
```

For example, the `title` element will be replaced by `Child Page One` as
indicated in the value for the `title` block. The complete HTML output
that results the previous markup is as follows.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Child Page One</title>
</head>
<body>
    <h1>Heading from Base Template</h1>

<h2>Page One</h2>

<p>This is actual content.</p>

</body>
</html>
```

Note that it’s possible to have multiple levels of template inheritance.
For example, you might have

-   A `base.html` template that underlies all pages on your site
-   An `external.html` template that extends `base.html` and forms the
    basis for all externally-visible pages
-   An `internal.html` template that also extends `base.html` but is
    only used for pages that are visible within the corporate firewall.

# More Information

- [Rendering templates](http://flask.pocoo.org/docs/0.10/quickstart/#rendering-templates) from Flask quick start
- [Templates page](http://flask.pocoo.org/docs/0.10/tutorial/templates/) from Flask tutorial
- [Home page for Jinja](http://jinja.pocoo.org/), the templating engine used by Flask

Last updated 2017-02-02 20:21:58 EST`;
