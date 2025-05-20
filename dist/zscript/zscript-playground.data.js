
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
      var PACKAGE_NAME = '/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript-playground.data';
      var REMOTE_PACKAGE_BASE = 'zscript-playground.data';
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
Module['FS_createPath']("/", "base_config", true, true);
Module['FS_createPath']("/", "headers", true, true);
Module['FS_createPath']("/headers", "examples", true, true);
Module['FS_createPath']("/headers", "ghost_zh", true, true);
Module['FS_createPath']("/headers/ghost_zh", "2.8", true, true);
Module['FS_createPath']("/headers", "gui_zh", true, true);
Module['FS_createPath']("/headers", "tango", true, true);
Module['FS_createPath']("/headers/tango", "1.3", true, true);
Module['FS_createPath']("/headers/tango", "font", true, true);
Module['FS_createPath']("/", "include", true, true);
Module['FS_createPath']("/include", "bindings", true, true);
Module['FS_createPath']("/include", "deprecated", true, true);
Module['FS_createPath']("/include", "std_zh", true, true);
Module['FS_createPath']("/include/std_zh", "string", true, true);

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
          }          Module['removeRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript-playground.data');

      };
      Module['addRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript-playground.data');

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
    loadPackage({"files": [{"filename": "/base_config/zscript.cfg", "start": 0, "end": 218}, {"filename": "/headers/examples/gui_example.zs", "start": 218, "end": 3944}, {"filename": "/headers/examples/tango_example.zs", "start": 3944, "end": 8927}, {"filename": "/headers/ghost.zh", "start": 8927, "end": 15836}, {"filename": "/headers/ghost_zh/2.8/changelog.txt", "start": 15836, "end": 26804}, {"filename": "/headers/ghost_zh/2.8/ghost2_common.zh", "start": 26804, "end": 30224}, {"filename": "/headers/ghost_zh/2.8/ghost2_deprecated.zh", "start": 30224, "end": 36242}, {"filename": "/headers/ghost_zh/2.8/ghost2_drawing.zh", "start": 36242, "end": 42582}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweapon.zh", "start": 42582, "end": 71275}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponDeath.zh", "start": 71275, "end": 78948}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponMovement.zh", "start": 78948, "end": 92844}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental.zh", "start": 92844, "end": 93902}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental2.zh", "start": 93902, "end": 94965}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental_movement.zh", "start": 94965, "end": 97018}, {"filename": "/headers/ghost_zh/2.8/ghost2_flags.zh", "start": 97018, "end": 99645}, {"filename": "/headers/ghost_zh/2.8/ghost2_global.zh", "start": 99645, "end": 109222}, {"filename": "/headers/ghost_zh/2.8/ghost2_init.zh", "start": 109222, "end": 115123}, {"filename": "/headers/ghost_zh/2.8/ghost2_init_bugged.zh", "start": 115123, "end": 119947}, {"filename": "/headers/ghost_zh/2.8/ghost2_modification.zh", "start": 119947, "end": 124100}, {"filename": "/headers/ghost_zh/2.8/ghost2_movement.zh", "start": 124100, "end": 156144}, {"filename": "/headers/ghost_zh/2.8/ghost2_other.zh", "start": 156144, "end": 174586}, {"filename": "/headers/ghost_zh/2.8/ghost2_scripts.zs", "start": 174586, "end": 175075}, {"filename": "/headers/ghost_zh/2.8/ghost2_update.zh", "start": 175075, "end": 197892}, {"filename": "/headers/ghost_zh/2.8/ghost_experimental.zh", "start": 197892, "end": 198117}, {"filename": "/headers/gui.zh", "start": 198117, "end": 199620}, {"filename": "/headers/gui_zh/guizh_button.zh", "start": 199620, "end": 201357}, {"filename": "/headers/gui_zh/guizh_checkbox.zh", "start": 201357, "end": 203316}, {"filename": "/headers/gui_zh/guizh_common.zh", "start": 203316, "end": 203531}, {"filename": "/headers/gui_zh/guizh_event.zh", "start": 203531, "end": 204344}, {"filename": "/headers/gui_zh/guizh_label.zh", "start": 204344, "end": 205151}, {"filename": "/headers/gui_zh/guizh_main.zh", "start": 205151, "end": 210431}, {"filename": "/headers/gui_zh/guizh_radioButton.zh", "start": 210431, "end": 213749}, {"filename": "/headers/gui_zh/guizh_root.zh", "start": 213749, "end": 214131}, {"filename": "/headers/gui_zh/guizh_spinner.zh", "start": 214131, "end": 216127}, {"filename": "/headers/gui_zh/guizh_types.zh", "start": 216127, "end": 218765}, {"filename": "/headers/gui_zh/guizh_widget.zh", "start": 218765, "end": 221300}, {"filename": "/headers/gui_zh/guizh_window.zh", "start": 221300, "end": 222625}, {"filename": "/headers/tango.zh", "start": 222625, "end": 229518}, {"filename": "/headers/tango/1.3/tango_access.zh", "start": 229518, "end": 232005}, {"filename": "/headers/tango/1.3/tango_common.zh", "start": 232005, "end": 239989}, {"filename": "/headers/tango/1.3/tango_deprecated.zh", "start": 239989, "end": 240198}, {"filename": "/headers/tango/1.3/tango_drawing.zh", "start": 240198, "end": 253012}, {"filename": "/headers/tango/1.3/tango_font.zh", "start": 253012, "end": 253871}, {"filename": "/headers/tango/1.3/tango_functions.zh", "start": 253871, "end": 275526}, {"filename": "/headers/tango/1.3/tango_loading.zh", "start": 275526, "end": 295106}, {"filename": "/headers/tango/1.3/tango_loggingFull.zh", "start": 295106, "end": 303513}, {"filename": "/headers/tango/1.3/tango_loggingMinimal.zh", "start": 303513, "end": 304097}, {"filename": "/headers/tango/1.3/tango_menu.zh", "start": 304097, "end": 323837}, {"filename": "/headers/tango/1.3/tango_messages.zh", "start": 323837, "end": 325999}, {"filename": "/headers/tango/1.3/tango_metrics.zh", "start": 325999, "end": 328256}, {"filename": "/headers/tango/1.3/tango_processing.zh", "start": 328256, "end": 356591}, {"filename": "/headers/tango/1.3/tango_script.zs", "start": 356591, "end": 356907}, {"filename": "/headers/tango/1.3/tango_stringControlCode.zh", "start": 356907, "end": 361778}, {"filename": "/headers/tango/1.3/tango_stringControlCodeDisabled.zh", "start": 361778, "end": 362097}, {"filename": "/headers/tango/1.3/tango_style.zh", "start": 362097, "end": 368510}, {"filename": "/headers/tango/1.3/tango_user.zh", "start": 368510, "end": 382577}, {"filename": "/headers/tango/1.3/tango_validation.zh", "start": 382577, "end": 391298}, {"filename": "/headers/tango/font/tango_Allegro.zh", "start": 391298, "end": 391560}, {"filename": "/headers/tango/font/tango_GUI.zh", "start": 391560, "end": 393056}, {"filename": "/headers/tango/font/tango_GUIBold.zh", "start": 393056, "end": 394553}, {"filename": "/headers/tango/font/tango_GUINarrow.zh", "start": 394553, "end": 396043}, {"filename": "/headers/tango/font/tango_LA.zh", "start": 396043, "end": 397068}, {"filename": "/headers/tango/font/tango_LttP.zh", "start": 397068, "end": 398536}, {"filename": "/headers/tango/font/tango_LttPSmall.zh", "start": 398536, "end": 400216}, {"filename": "/headers/tango/font/tango_Matrix.zh", "start": 400216, "end": 400672}, {"filename": "/headers/tango/font/tango_NES.zh", "start": 400672, "end": 400957}, {"filename": "/headers/tango/font/tango_Oracle.zh", "start": 400957, "end": 401252}, {"filename": "/headers/tango/font/tango_OracleProportional.zh", "start": 401252, "end": 402766}, {"filename": "/headers/tango/font/tango_Phantom.zh", "start": 402766, "end": 403028}, {"filename": "/headers/tango/font/tango_PhantomProportional.zh", "start": 403028, "end": 404589}, {"filename": "/headers/tango/font/tango_SS3.zh", "start": 404589, "end": 406073}, {"filename": "/headers/tango/font/tango_Small.zh", "start": 406073, "end": 406321}, {"filename": "/headers/tango/font/tango_Small2.zh", "start": 406321, "end": 406574}, {"filename": "/headers/tango/font/tango_SmallProportional.zh", "start": 406574, "end": 408076}, {"filename": "/include/EmilyMisc.zh", "start": 408076, "end": 458823}, {"filename": "/include/bindings.zh", "start": 458823, "end": 463133}, {"filename": "/include/bindings/audio.zh", "start": 463133, "end": 472789}, {"filename": "/include/bindings/bitmap.zh", "start": 472789, "end": 494469}, {"filename": "/include/bindings/bottledata.zh", "start": 494469, "end": 495609}, {"filename": "/include/bindings/bottleshopdata.zh", "start": 495609, "end": 496607}, {"filename": "/include/bindings/combodata.zh", "start": 496607, "end": 525013}, {"filename": "/include/bindings/common.zh", "start": 525013, "end": 562111}, {"filename": "/include/bindings/debug.zh", "start": 562111, "end": 563782}, {"filename": "/include/bindings/directory.zh", "start": 563782, "end": 564996}, {"filename": "/include/bindings/dmapdata.zh", "start": 564996, "end": 574772}, {"filename": "/include/bindings/dropsetdata.zh", "start": 574772, "end": 575487}, {"filename": "/include/bindings/eweapon.zh", "start": 575487, "end": 585671}, {"filename": "/include/bindings/ffc.zh", "start": 585671, "end": 590441}, {"filename": "/include/bindings/file.zh", "start": 590441, "end": 596097}, {"filename": "/include/bindings/filesystem.zh", "start": 596097, "end": 597117}, {"filename": "/include/bindings/game.zh", "start": 597117, "end": 648182}, {"filename": "/include/bindings/genericdata.zh", "start": 648182, "end": 650171}, {"filename": "/include/bindings/global.zh", "start": 650171, "end": 675363}, {"filename": "/include/bindings/graphics.zh", "start": 675363, "end": 679549}, {"filename": "/include/bindings/hero.zh", "start": 679549, "end": 708425}, {"filename": "/include/bindings/input.zh", "start": 708425, "end": 715246}, {"filename": "/include/bindings/itemdata.zh", "start": 715246, "end": 741497}, {"filename": "/include/bindings/itemsprite.zh", "start": 741497, "end": 747234}, {"filename": "/include/bindings/lweapon.zh", "start": 747234, "end": 759141}, {"filename": "/include/bindings/mapdata.zh", "start": 759141, "end": 785255}, {"filename": "/include/bindings/messagedata.zh", "start": 785255, "end": 789919}, {"filename": "/include/bindings/npc.zh", "start": 789919, "end": 818601}, {"filename": "/include/bindings/npcdata.zh", "start": 818601, "end": 829825}, {"filename": "/include/bindings/paldata.zh", "start": 829825, "end": 836004}, {"filename": "/include/bindings/portal.zh", "start": 836004, "end": 836913}, {"filename": "/include/bindings/qrs.zh", "start": 836913, "end": 870511}, {"filename": "/include/bindings/randgen.zh", "start": 870511, "end": 872615}, {"filename": "/include/bindings/region.zh", "start": 872615, "end": 876691}, {"filename": "/include/bindings/savedportal.zh", "start": 876691, "end": 877507}, {"filename": "/include/bindings/screendata.zh", "start": 877507, "end": 929407}, {"filename": "/include/bindings/shopdata.zh", "start": 929407, "end": 930115}, {"filename": "/include/bindings/sprite.zh", "start": 930115, "end": 939081}, {"filename": "/include/bindings/spritedata.zh", "start": 939081, "end": 940195}, {"filename": "/include/bindings/stack.zh", "start": 940195, "end": 943190}, {"filename": "/include/bindings/subscreendata.zh", "start": 943190, "end": 957205}, {"filename": "/include/bindings/subscreenpage.zh", "start": 957205, "end": 959386}, {"filename": "/include/bindings/subscreenwidget.zh", "start": 959386, "end": 978582}, {"filename": "/include/bindings/text.zh", "start": 978582, "end": 980122}, {"filename": "/include/bindings/viewport.zh", "start": 980122, "end": 982612}, {"filename": "/include/bindings/websocket.zh", "start": 982612, "end": 985165}, {"filename": "/include/bindings/zinfo.zh", "start": 985165, "end": 985551}, {"filename": "/include/deprecated/sram.zh", "start": 985551, "end": 987476}, {"filename": "/include/deprecated/theRandomHeader.zh", "start": 987476, "end": 1018199}, {"filename": "/include/deprecated/time.zh", "start": 1018199, "end": 1028441}, {"filename": "/include/ffcscript.zh", "start": 1028441, "end": 1028486}, {"filename": "/include/std.zh", "start": 1028486, "end": 1029104}, {"filename": "/include/std_zh/ghostBasedMovement.zh", "start": 1029104, "end": 1038696}, {"filename": "/include/std_zh/limits.zh", "start": 1038696, "end": 1040806}, {"filename": "/include/std_zh/script_runners.zh", "start": 1040806, "end": 1047733}, {"filename": "/include/std_zh/std.cfg", "start": 1047733, "end": 1049417}, {"filename": "/include/std_zh/std_constants.zh", "start": 1049417, "end": 1066048}, {"filename": "/include/std_zh/std_extension.zh", "start": 1066048, "end": 1137013}, {"filename": "/include/std_zh/std_functions.zh", "start": 1137013, "end": 1229256}, {"filename": "/include/std_zh/std_keyboard.zh", "start": 1229256, "end": 1240084}, {"filename": "/include/std_zh/std_sideview.zh", "start": 1240084, "end": 1242982}, {"filename": "/include/std_zh/string/string_constants.zh", "start": 1242982, "end": 1256929}, {"filename": "/include/std_zh/string/string_functions.zh", "start": 1256929, "end": 1279641}, {"filename": "/include/string.zh", "start": 1279641, "end": 1279821}], "remote_package_size": 1279821, "package_uuid": "sha256-2a65581dab1027da9b19c9f5dd4c18ce7a8cfac91a2c3890669331dc8c196ab6"});

  })();

export default Module;