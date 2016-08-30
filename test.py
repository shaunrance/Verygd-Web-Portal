import json
import server

from io import BytesIO
from PIL import Image

from falcon.testing import TestCase


class TestPhotoAPI(TestCase):
    def api_class(self):
        return server.photo_api

    def tearDown(self):
        server.photos = {}

    def get_test_image(self):
        f = BytesIO()

        image = Image.new('RGBA', size=(250, 250))
        image.save(f, 'png')
        f.seek(0)

        return str(f.readlines())

    def test_add_photo(self):
        result = self.simulate_post(
            path='/photos', body=self.get_test_image(),
            headers={'Content-Type': 'image/png'}
        )

        self.assertTrue(result.status_code == 201, result.status)

        return result

    def test_delete(self):
        result = self.test_add_photo()

        new_photo_resource = result.headers['location']

        result = self.simulate_delete(path=new_photo_resource)

        self.assertTrue(result.status_code == 204, result.status)

    def test_list_photos(self, n=5):
        for _ in range(1, n):
            result = self.test_add_photo()

            self.assertTrue(result.status_code == 201, result.status)

        result = self.simulate_get('/photos')

        self.assertTrue(result.status_code == 200, result.status)

        photo_urls = json.loads(result.content.decode())

        self.assertTrue(len(photo_urls) == n-1)
