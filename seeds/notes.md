@@topic: flask-templates
@@title: Flask Templates

@@output: +notes +podium

@@segment: template-intro

# Flask/Jinja Templates of Doom

Templates provide a convenient way to create an HTML page. Flask’s
`render_template` method takes the name of a template file and converts
it to a string that you can return from a view function.

@@segment: static-templates

## "Static" Templates

This route handler function
returns the contents of the template file `hello.html`.

@@output: static-view-function +projector +participant

```
@app.route('/')
def hello_world():
    return render_template('hello.html')
```

@@undo

The `hello.html` file itself contains the following.

@@output: static-flask-template +projector +participant

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

@@undo

@@segment: basic-templates

# Basic Templates

The previous example isn’t really a "template," 
in that it doesn't
provide any way to change the content of the page at run time. It’s
simply a static HTML file that’s rendered exactly as is.

Templates are more useful when they include dynamically generated
content from the Python view function. Consider the following template:

@@output: basic-flask-template +projector +participant

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

@@undo

In the `h1` tag, note the `{{ name }}` syntax. The double curly braces
enclose the name of a template variable whose value will be interpolated
into the HTML. That is, the entire sequence `{{ name }}` will be
replaced by the value of the `name` variable that is passed to the
template from the Python view function, as illustrated next.

@@output: basic-view-function +projector +participant

```
@app.route('/name')
def hello_name():
    return render_template('hello-name.html', name='Fred Ziffle')
```

@@undo

This view function renders the `hello-name.html` template and supplies
the string `'Fred Ziffle'` as the value of the `name` template variable.
The resulting `h1` element will be:

@@output: result +projector +participant

```
<h1>Hello, Fred Ziffle</h1>
```

@@undo
