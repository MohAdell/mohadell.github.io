'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "09f339fae513cddfc7363774814a6433",
"assets/AssetManifest.bin.json": "198e17678ee5835817e6e21065293796",
"assets/AssetManifest.json": "45907be6450fe960b82e8726d0be6b54",
"assets/assets/icons/behance.svg": "35ad2d47e647d0b168e7707b2984c6b5",
"assets/assets/icons/check.svg": "4220c82511cc1dfb40b8bba7d25c5f55",
"assets/assets/icons/download.svg": "628700a3031424d215a441fab2da1731",
"assets/assets/icons/facebook.svg": "1007f30c5104d0222535de74178fe1d2",
"assets/assets/icons/favicon.ico": "55224d5e019c8f08943e64ba2d74a651",
"assets/assets/icons/github.svg": "9226aa209923e38c0a6ddcb236e2bc68",
"assets/assets/icons/instagram.svg": "d82bfc5ea8771172545c566ea227c26c",
"assets/assets/icons/leetcode.svg": "cce69cd38d774b70be2893b1072830a5",
"assets/assets/icons/linkedin.svg": "d9d213957d8c55447dc9884eeef8c486",
"assets/assets/icons/twitter.svg": "a4a0163fef48a4247a305528c07bc4fa",
"assets/assets/images/bg.jpeg": "af02a2cbd00d9f2c257a8c6f59103881",
"assets/assets/images/pro.jpg": "1c808199a2093296cd2b6b9ef0feeb51",
"assets/assets/images/pro.png": "f94bac0ba9a49b2cf33284b2cc595f68",
"assets/assets/images/profile.jpg": "a789647235e30c5ca7ac69a054ae1582",
"assets/assets/images/WindowsPCHealthCheckSetup.msi": "acacd8a9b08b7881baa064762d6eee3c",
"assets/assets/Mohamed%2520Adel%2520Attia%2520V0.1.pdf": "f45f21c21a8a4bcb495b63d98ce08576",
"assets/assets/Mohamed%2520Adel%2520Attia%2520V0.2.pdf": "4926d1f80ca90399a287707e88a6bd0a",
"assets/assets/screens/blogger/Screenshot%25202024-12-02%2520175856.png": "a676cdb0cc9fa2026307aa816582a099",
"assets/assets/screens/blogger/Screenshot%25202024-12-02%2520175910.png": "bc23ac165fa4165348111d45cdfe3f06",
"assets/assets/screens/blogger/Screenshot%25202024-12-02%2520180922.png": "d0cf6d2d26d0a82ff1f3290accd73c35",
"assets/assets/screens/blogger/Screenshot%25202024-12-02%2520180932.png": "2146c35a6a90fcef401c693ac2d17141",
"assets/assets/screens/blogger/Screenshot%25202024-12-02%2520181007.png": "998a0d11cba18fe670416faa10bde8b3",
"assets/assets/screens/Google%2520Analytics/Screenshot%25202024-12-02%2520181832.png": "64545cbecab755e7f5490154fb2ba908",
"assets/assets/screens/Google%2520Analytics/Screenshot%25202024-12-02%2520181845.png": "609060142ae504e61a713fed436ec468",
"assets/assets/screens/Google%2520Analytics/Screenshot%25202024-12-02%2520181858.png": "b9463de56cf1d5bb4ca750adcf188ed8",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520174914.png": "fb74c9d2a1b1dfa926c03fa830e4a74a",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520174942.png": "3cae2ecb9692bb511e7123b446baa36e",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520174956.png": "d160b770ce784082be72d3bcec692970",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520175016.png": "bd8cc7255a2d75a5e52f98767b24fb2c",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520175244.png": "2624f9143d07717865ad592e15f62cfe",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520175258.png": "abbff6fdf49ba5f463b304c392ebffad",
"assets/assets/screens/instagram/Screenshot%25202024-12-02%2520175448.png": "ae37d8bc6e513675b718f13bf3771ece",
"assets/assets/screens/WebBuilderProjects/111.jpg": "20ed558f7caeb29d930bbce392b77690",
"assets/assets/screens/WebBuilderProjects/11111.png": "0d06892fa4d3b199118480c8bfd55a24",
"assets/assets/screens/WebBuilderProjects/education/1.jpg": "ecd1a7a9853629fdb20fae87b6e60d9e",
"assets/assets/screens/WebBuilderProjects/education/2.jpg": "ecd1a7a9853629fdb20fae87b6e60d9e",
"assets/assets/screens/WebBuilderProjects/education/3.jpg": "ecd1a7a9853629fdb20fae87b6e60d9e",
"assets/assets/screens/WebBuilderProjects/education/4.jpg": "ecd1a7a9853629fdb20fae87b6e60d9e",
"assets/assets/screens/WebBuilderProjects/education/education%2520website%2520ui.jpg": "5c5d4ac31a779f76fe1ac72f2f362312",
"assets/assets/screens/WebBuilderProjects/education/education%2520website.png": "60a8c972aa9fbfd05884dc7d21e11c5a",
"assets/assets/screens/WebBuilderProjects/education/education_6785648.png": "1cf5b74511c5d7173f1a4c8e488fd466",
"assets/assets/screens/WebBuilderProjects/news_1450878.png": "b4e662cbdf7d7734ac74d0865ab064e9",
"assets/assets/screens/WebBuilderProjects/Screenshot%25202024-12-02%2520194941.png": "4484a75cbbb548b0bf63e6439ba2cee0",
"assets/assets/screens/WebBuilderProjects/Screenshot%25202024-12-02%2520195622.png": "23c4357e683cc2b5c64518963fa06ce2",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "0db35ae7a415370b89e807027510caf0",
"assets/NOTICES": "ca2f5610998d194e981c6a746870a2ca",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "de27f912e40a372c22a069c1c7244d9b",
"canvaskit/canvaskit.js.symbols": "25b66ed57bca264b764d81e0836d06ff",
"canvaskit/canvaskit.wasm": "0e8df9401cf439e22db32d8c8af2dc5f",
"canvaskit/chromium/canvaskit.js": "73343b0c5d471d1114d7f02e06c1fdb2",
"canvaskit/chromium/canvaskit.js.symbols": "56485348c9a6b86ace4d456b93cbed4c",
"canvaskit/chromium/canvaskit.wasm": "367a3f990f96fb2f2891bb75cd49c1ff",
"canvaskit/skwasm.js": "c757bee7edc67bf93024e6df40a7e31e",
"canvaskit/skwasm.js.symbols": "45ab593149bd9a9f2642e220260a2153",
"canvaskit/skwasm.wasm": "5406751ddfda2935adadf99c7ab0fcb4",
"canvaskit/skwasm_st.js": "d1326ceef381ad382ab492ba5d96f04d",
"canvaskit/skwasm_st.js.symbols": "3d2d3f0ce1f4787fc09f5aadd286551f",
"canvaskit/skwasm_st.wasm": "da25fa0877408d3bf62c136efe281740",
"favicon.png": "f94bac0ba9a49b2cf33284b2cc595f68",
"flutter.js": "76f08d47ff9f5715220992f993002504",
"flutter_bootstrap.js": "b19ee64bc1fd4b3acb8b43f722b6bc0a",
"icons/favicon.ico": "55224d5e019c8f08943e64ba2d74a651",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "a0feba16116bebc20be1210a519429e4",
"/": "a0feba16116bebc20be1210a519429e4",
"main.dart.js": "b1d03ed61bd677578632bc40c920bc6d",
"manifest.json": "14533758d5adebb52c270151b0335f00",
"version.json": "1ac57eb0214a8f5216f1da7dd479b33f"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
