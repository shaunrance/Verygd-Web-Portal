import falcon

import uuid
import mimetypes

import io

photos = {}


class Collection(object):
    def on_post(self, req, resp):
        ext = mimetypes.guess_extension(req.content_type)
        filename = '{uuid}{ext}'.format(uuid=uuid.uuid4(), ext=ext)

        photos.setdefault(filename, '')

        photos[filename] = req.stream.read()

        resp.status = falcon.HTTP_201
        resp.location = '/photos/' + filename


class Item(object):
    def on_get(self, req, resp, name):
        resp.content_type = mimetypes.guess_type(name)[0]

        if name in photos:
            resp.stream = io.BytesIO(photos[name])
            resp.stream_len = len(photos[name])
        else:
            resp = falcon.HTTP_400

api = application = falcon.API()

image_collection = Collection()
image = Item()

api.add_route('/photos', image_collection)
api.add_route('/photos/{name}', image)
