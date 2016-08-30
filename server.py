import falcon
import json

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

    def on_get(self, req, resp):
        photo_urls = ['/photos/{filename}'.format(filename=k) for k in photos]

        if req.client_accepts_json:
            resp.body = json.dumps(photo_urls)
        else:
            resp.body = ', '.join(photo_urls)


class Item(object):
    def on_get(self, req, resp, name):
        resp.content_type = mimetypes.guess_type(name)[0]

        if name in photos:
            resp.stream = io.BytesIO(photos[name])
            resp.stream_len = len(photos[name])
        else:
            resp = falcon.HTTP_400

    def on_delete(self, req, resp, name):
        if name in photos:
            del photos[name]
            resp.status = falcon.HTTP_204
        else:
            resp.status = falcon.HTTP_400


photo_api = application = falcon.API()

image_collection = Collection()
image = Item()

photo_api.add_route('/photos', image_collection)
photo_api.add_route('/photos/{name}', image)
