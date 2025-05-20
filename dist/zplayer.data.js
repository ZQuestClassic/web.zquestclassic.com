
  var Module = typeof Module != 'undefined' ? Module : {};

  Module['expectedDataFileDownloads'] ??= 0;
  Module['expectedDataFileDownloads']++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zplayer.data';
      var REMOTE_PACKAGE_BASE = 'zplayer.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        
        Module['dataFileDownloads'] ??= {};
        fetch(packageName)
          .catch((cause) => Promise.reject(new Error(`Network Error: ${packageName}`, {cause}))) // If fetch fails, rewrite the error to include the failing URL & the cause.
          .then((response) => {
            if (!response.ok) {
              return Promise.reject(new Error(`${response.status}: ${response.url}`));
            }

            if (!response.body && response.arrayBuffer) { // If we're using the polyfill, readers won't be available...
              return response.arrayBuffer().then(callback);
            }

            const reader = response.body.getReader();
            const iterate = () => reader.read().then(handleChunk).catch((cause) => {
              return Promise.reject(new Error(`Unexpected error while handling : ${response.url} ${cause}`, {cause}));
            });

            const chunks = [];
            const headers = response.headers;
            const total = Number(headers.get('Content-Length') ?? packageSize);
            let loaded = 0;

            const handleChunk = ({done, value}) => {
              if (!done) {
                chunks.push(value);
                loaded += value.length;
                Module['dataFileDownloads'][packageName] = {loaded, total};

                let totalLoaded = 0;
                let totalSize = 0;

                for (const download of Object.values(Module['dataFileDownloads'])) {
                  totalLoaded += download.loaded;
                  totalSize += download.total;
                }

                Module['setStatus']?.(`Downloading data... (${totalLoaded}/${totalSize})`);
                return iterate();
              } else {
                const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
                let offset = 0;
                for (const chunk of chunks) {
                  packageData.set(chunk, offset);
                  offset += chunk.length;
                }
                callback(packageData.buffer);
              }
            };

            Module['setStatus']?.('Downloading data...');
            return iterate();
          });
      };

      function handleError(error) {
        console.error('package error:', error);
      };

    function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "assets", true, true);
Module['FS_createPath']("/assets", "zc", true, true);
Module['FS_createPath']("/", "base_config", true, true);
Module['FS_createPath']("/", "etc", true, true);
Module['FS_createPath']("/", "modules", true, true);
Module['FS_createPath']("/modules", "classic", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

        var PACKAGE_UUID = metadata['package_uuid'];
        var IDB_RO = "readonly";
        var IDB_RW = "readwrite";
        var DB_NAME = "EM_PRELOAD_CACHE";
        var DB_VERSION = 1;
        var METADATA_STORE_NAME = 'METADATA';
        var PACKAGE_STORE_NAME = 'PACKAGES';
        function openDatabase(callback, errback) {
          var indexedDB;
          if (typeof window === 'object') {
            indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
          } else if (typeof location !== 'undefined') {
            // worker
            indexedDB = self.indexedDB;
          } else {
            throw 'using IndexedDB to cache data can only be done on a web page or in a web worker';
          }
          try {
            var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
          } catch (e) {
            return errback(e);
          }
          openRequest.onupgradeneeded = (event) => {
            var db = /** @type {IDBDatabase} */ (event.target.result);

            if (db.objectStoreNames.contains(PACKAGE_STORE_NAME)) {
              db.deleteObjectStore(PACKAGE_STORE_NAME);
            }
            var packages = db.createObjectStore(PACKAGE_STORE_NAME);

            if (db.objectStoreNames.contains(METADATA_STORE_NAME)) {
              db.deleteObjectStore(METADATA_STORE_NAME);
            }
            var metadata = db.createObjectStore(METADATA_STORE_NAME);
          };
          openRequest.onsuccess = (event) => {
            var db = /** @type {IDBDatabase} */ (event.target.result);
            callback(db);
          };
          openRequest.onerror = (error) => errback(error);
        };

        // This is needed as chromium has a limit on per-entry files in IndexedDB
        // https://cs.chromium.org/chromium/src/content/renderer/indexed_db/webidbdatabase_impl.cc?type=cs&sq=package:chromium&g=0&l=177
        // https://cs.chromium.org/chromium/src/out/Debug/gen/third_party/blink/public/mojom/indexeddb/indexeddb.mojom.h?type=cs&sq=package:chromium&g=0&l=60
        // We set the chunk size to 64MB to stay well-below the limit
        var CHUNK_SIZE = 64 * 1024 * 1024;

        function cacheRemotePackage(
          db,
          packageName,
          packageData,
          packageMeta,
          callback,
          errback
        ) {
          var transactionPackages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
          var packages = transactionPackages.objectStore(PACKAGE_STORE_NAME);
          var chunkSliceStart = 0;
          var nextChunkSliceStart = 0;
          var chunkCount = Math.ceil(packageData.byteLength / CHUNK_SIZE);
          var finishedChunks = 0;
          for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
            nextChunkSliceStart += CHUNK_SIZE;
            var putPackageRequest = packages.put(
              packageData.slice(chunkSliceStart, nextChunkSliceStart),
              `package/${packageName}/${chunkId}`
            );
            chunkSliceStart = nextChunkSliceStart;
            putPackageRequest.onsuccess = (event) => {
              finishedChunks++;
              if (finishedChunks == chunkCount) {
                var transaction_metadata = db.transaction(
                  [METADATA_STORE_NAME],
                  IDB_RW
                );
                var metadata = transaction_metadata.objectStore(METADATA_STORE_NAME);
                var putMetadataRequest = metadata.put(
                  {
                    'uuid': packageMeta.uuid,
                    'chunkCount': chunkCount
                  },
                  `metadata/${packageName}`
                );
                putMetadataRequest.onsuccess = (event) =>  callback(packageData);
                putMetadataRequest.onerror = (error) => errback(error);
              }
            };
            putPackageRequest.onerror = (error) => errback(error);
          }
        }

        /* Check if there's a cached package, and if so whether it's the latest available */
        function checkCachedPackage(db, packageName, callback, errback) {
          var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
          var metadata = transaction.objectStore(METADATA_STORE_NAME);
          var getRequest = metadata.get(`metadata/${packageName}`);
          getRequest.onsuccess = (event) => {
            var result = event.target.result;
            if (!result) {
              return callback(false, null);
            } else {
              return callback(PACKAGE_UUID === result['uuid'], result);
            }
          };
          getRequest.onerror = (error) => errback(error);
        }

        function fetchCachedPackage(db, packageName, metadata, callback, errback) {
          var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
          var packages = transaction.objectStore(PACKAGE_STORE_NAME);

          var chunksDone = 0;
          var totalSize = 0;
          var chunkCount = metadata['chunkCount'];
          var chunks = new Array(chunkCount);

          for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
            var getRequest = packages.get(`package/${packageName}/${chunkId}`);
            getRequest.onsuccess = (event) => {
              if (!event.target.result) {
                errback(new Error(`CachedPackageNotFound for: ${packageName}`));
                return;
              }
              // If there's only 1 chunk, there's nothing to concatenate it with so we can just return it now
              if (chunkCount == 1) {
                callback(event.target.result);
              } else {
                chunksDone++;
                totalSize += event.target.result.byteLength;
                chunks.push(event.target.result);
                if (chunksDone == chunkCount) {
                  if (chunksDone == 1) {
                    callback(event.target.result);
                  } else {
                    var tempTyped = new Uint8Array(totalSize);
                    var byteOffset = 0;
                    for (var chunkId in chunks) {
                      var buffer = chunks[chunkId];
                      tempTyped.set(new Uint8Array(buffer), byteOffset);
                      byteOffset += buffer.byteLength;
                      buffer = undefined;
                    }
                    chunks = undefined;
                    callback(tempTyped.buffer);
                    tempTyped = undefined;
                  }
                }
              }
            };
            getRequest.onerror = (error) => errback(error);
          }
        }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zplayer.data');

      };
      Module['addRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zplayer.data');

      Module['preloadResults'] ??= {};

        function preloadFallback(error) {
          console.error(error);
          console.error('falling back to default preload behavior');
          fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, processPackageData, handleError);
        };

        openDatabase(
          (db) => checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME,
              (useCached, metadata) => {
                Module['preloadResults'][PACKAGE_NAME] = {fromCache: useCached};
                if (useCached) {
                  fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, metadata, processPackageData, preloadFallback);
                } else {
                  fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE,
                    (packageData) => {
                      cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {uuid:PACKAGE_UUID}, processPackageData,
                        (error) => {
                          console.error(error);
                          processPackageData(packageData);
                        });
                    }
                  , preloadFallback);
                }
              }, preloadFallback)
        , preloadFallback);

        Module['setStatus']?.('Downloading...');

    }
    if (Module['calledRun']) {
      runWithFS(Module);
    } else {
      (Module['preRun'] ??= []).push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/Classic.nsf", "start": 0, "end": 61568}, {"filename": "/allegro5.cfg", "start": 61568, "end": 69226}, {"filename": "/assets/cursor.bmp", "start": 69226, "end": 70560}, {"filename": "/assets/dungeon.mid", "start": 70560, "end": 73066}, {"filename": "/assets/ending.mid", "start": 73066, "end": 85139}, {"filename": "/assets/gameover.mid", "start": 85139, "end": 85824}, {"filename": "/assets/gui_pal.bmp", "start": 85824, "end": 87158}, {"filename": "/assets/level9.mid", "start": 87158, "end": 90515}, {"filename": "/assets/overworld.mid", "start": 90515, "end": 98919}, {"filename": "/assets/title.mid", "start": 98919, "end": 107520}, {"filename": "/assets/triforce.mid", "start": 107520, "end": 108178}, {"filename": "/assets/zc/ZC_Forever_HD.mp3", "start": 108178, "end": 4097515, "audio": 1}, {"filename": "/assets/zc/ZC_Icon_Medium_Player.png", "start": 4097515, "end": 4105522}, {"filename": "/assets/zc/ZC_Logo.png", "start": 4105522, "end": 4132713}, {"filename": "/base_config/zc.cfg", "start": 4132713, "end": 4136868}, {"filename": "/base_config/zcl.cfg", "start": 4136868, "end": 4137487}, {"filename": "/base_config/zquest.cfg", "start": 4137487, "end": 4141010}, {"filename": "/base_config/zscript.cfg", "start": 4141010, "end": 4141228}, {"filename": "/etc/2MGM.cfg", "start": 4141228, "end": 4148664}, {"filename": "/etc/freepats.cfg", "start": 4148664, "end": 4153185}, {"filename": "/etc/oot.cfg", "start": 4153185, "end": 4155430}, {"filename": "/etc/ppl160.cfg", "start": 4155430, "end": 4159598}, {"filename": "/etc/ultra.cfg", "start": 4159598, "end": 4164021}, {"filename": "/etc/zc.cfg", "start": 4164021, "end": 4169545}, {"filename": "/modules/classic/classic_fonts.dat", "start": 4169545, "end": 4272310}, {"filename": "/modules/classic/default.qst", "start": 4272310, "end": 7421989}, {"filename": "/modules/classic/title_gfx.dat", "start": 7421989, "end": 7561045}, {"filename": "/modules/classic/zelda.nsf", "start": 7561045, "end": 7565977}, {"filename": "/sfx.dat", "start": 7565977, "end": 8815110}, {"filename": "/zc.png", "start": 8815110, "end": 8843995}, {"filename": "/zc_web.cfg", "start": 8843995, "end": 8844351}, {"filename": "/zquest_web.cfg", "start": 8844351, "end": 8844405}], "remote_package_size": 8844405, "package_uuid": "sha256-321a1d496ecc9af58c8d7ba6fe097cd7a7a6520aad1e7d8a5cdc9f0e58ce10a1"});

  })();
