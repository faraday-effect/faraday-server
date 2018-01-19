# Naming Convention

In these seed files,
use the Mongo `_id` convention
for unique identifiers.

References to related `_id` values
are named `foo_id`,
where `foo` is the name of the related collection.

Elsewhere in the server code,
prefer the more readable and friendly `uid`.
Where necessary, the code
maps `uid` to `_id` when sending a query to Mongo.

In the past,
there were some fields with _both_ `_id` and `uid`,
which seemed like a Really Dumb Idea.