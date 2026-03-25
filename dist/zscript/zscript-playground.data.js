
  var Module = typeof Module != 'undefined' ? Module : {};

  Module['expectedDataFileDownloads'] ??= 0;
  Module['expectedDataFileDownloads']++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    async function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript-playground.data';
      var REMOTE_PACKAGE_BASE = 'zscript-playground.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile']?.(REMOTE_PACKAGE_BASE, '') ?? REMOTE_PACKAGE_BASE;
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      async function fetchRemotePackage(packageName, packageSize) {
        
        Module['dataFileDownloads'] ??= {};
        try {
          var response = await fetch(packageName);
        } catch (e) {
          throw new Error(`Network Error: ${packageName}`, {e});
        }
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.url}`);
        }

        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get('Content-Length') ?? packageSize);
        let loaded = 0;

        Module['setStatus']?.('Downloading data...');
        const reader = response.body.getReader();

        while (1) {
          var {done, value} = await reader.read();
          if (done) break;
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
        }

        const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
        let offset = 0;
        for (const chunk of chunks) {
          packageData.set(chunk, offset);
          offset += chunk.length;
        }
        return packageData.buffer;
      }

    async function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw new Error(msg);
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
        finish: async function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slice into the heap that will never change
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

        async function openDatabase() {
          if (typeof indexedDB == 'undefined') {
            throw new Error('using IndexedDB to cache data can only be done on a web page or in a web worker');
          }
          return new Promise((resolve, reject) => {
            var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
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
              resolve(db);
            };
            openRequest.onerror = reject;
          });
        }

        // This is needed as chromium has a limit on per-entry files in IndexedDB
        // https://cs.chromium.org/chromium/src/content/renderer/indexed_db/webidbdatabase_impl.cc?type=cs&sq=package:chromium&g=0&l=177
        // https://cs.chromium.org/chromium/src/out/Debug/gen/third_party/blink/public/mojom/indexeddb/indexeddb.mojom.h?type=cs&sq=package:chromium&g=0&l=60
        // We set the chunk size to 64MB to stay well-below the limit
        var CHUNK_SIZE = 64 * 1024 * 1024;

        async function cacheRemotePackage(db, packageName, packageData, packageMeta) {
          var transactionPackages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
          var packages = transactionPackages.objectStore(PACKAGE_STORE_NAME);
          var chunkSliceStart = 0;
          var nextChunkSliceStart = 0;
          var chunkCount = Math.ceil(packageData.byteLength / CHUNK_SIZE);
          var finishedChunks = 0;

          return new Promise((resolve, reject) => {
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
                  putMetadataRequest.onsuccess = (event) => resolve(packageData);
                  putMetadataRequest.onerror = reject;
                }
              };
              putPackageRequest.onerror = reject;
            }
          });
        }

        /*
         * Check if there's a cached package, and if so whether it's the latest available.
         * Resolves to the cached metadata, or `null` if it is missing or out-of-date.
         */
        async function checkCachedPackage(db, packageName) {
          var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
          var metadata = transaction.objectStore(METADATA_STORE_NAME);
          var getRequest = metadata.get(`metadata/${packageName}`);
          return new Promise((resolve, reject) => {
            getRequest.onsuccess = (event) => {
              var result = event.target.result;
              if (result && PACKAGE_UUID === result['uuid']) {
                resolve(result);
              } else {
                resolve(null);
              }
            }
            getRequest.onerror = reject;
          });
        }

        async function fetchCachedPackage(db, packageName, metadata) {
          var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
          var packages = transaction.objectStore(PACKAGE_STORE_NAME);

          var chunksDone = 0;
          var totalSize = 0;
          var chunkCount = metadata['chunkCount'];
          var chunks = new Array(chunkCount);

          return new Promise((resolve, reject) => {
            for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
              var getRequest = packages.get(`package/${packageName}/${chunkId}`);
              getRequest.onsuccess = (event) => {
                if (!event.target.result) {
                  reject(`CachedPackageNotFound for: ${packageName}`);
                  return;
                }
                // If there's only 1 chunk, there's nothing to concatenate it with so we can just return it now
                if (chunkCount == 1) {
                  resolve(event.target.result);
                } else {
                  chunksDone++;
                  totalSize += event.target.result.byteLength;
                  chunks.push(event.target.result);
                  if (chunksDone == chunkCount) {
                    if (chunksDone == 1) {
                      resolve(event.target.result);
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
                      resolve(tempTyped.buffer);
                      tempTyped = undefined;
                    }
                  }
                }
              };
              getRequest.onerror = reject;
            }
          });
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

      }
      Module['addRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript-playground.data');

      Module['preloadResults'] ??= {};

        async function preloadFallback(error) {
          console.error(error);
          console.error('falling back to default preload behavior');
          processPackageData(await fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE));
        }

        try {
          var db = await openDatabase();
          var pkgMetadata = await checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME);
          var useCached = !!pkgMetadata;
          Module['preloadResults'][PACKAGE_NAME] = {fromCache: useCached};
          if (useCached) {
            processPackageData(await fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, pkgMetadata));
          } else {
            var packageData = await fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);
            try {
              processPackageData(await cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {uuid:PACKAGE_UUID}))
            } catch (error) {
              console.error(error);
              processPackageData(packageData);
            }
          }
        } catch(e) {
          await preloadFallback(e);
        }

        Module['setStatus']?.('Downloading...');

    }
    if (Module['calledRun']) {
      runWithFS(Module);
    } else {
      (Module['preRun'] ??= []).push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/base_config/zscript.cfg", "start": 0, "end": 218}, {"filename": "/headers/examples/gui_example.zs", "start": 218, "end": 3944}, {"filename": "/headers/examples/tango_example.zs", "start": 3944, "end": 8935}, {"filename": "/headers/ghost.zh", "start": 8935, "end": 15940}, {"filename": "/headers/ghost_zh/2.8/changelog.txt", "start": 15940, "end": 26908}, {"filename": "/headers/ghost_zh/2.8/ghost2_common.zh", "start": 26908, "end": 30328}, {"filename": "/headers/ghost_zh/2.8/ghost2_deprecated.zh", "start": 30328, "end": 36346}, {"filename": "/headers/ghost_zh/2.8/ghost2_drawing.zh", "start": 36346, "end": 42483}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweapon.zh", "start": 42483, "end": 71176}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponDeath.zh", "start": 71176, "end": 78849}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponMovement.zh", "start": 78849, "end": 92745}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental.zh", "start": 92745, "end": 93803}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental2.zh", "start": 93803, "end": 94866}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental_movement.zh", "start": 94866, "end": 96919}, {"filename": "/headers/ghost_zh/2.8/ghost2_flags.zh", "start": 96919, "end": 99546}, {"filename": "/headers/ghost_zh/2.8/ghost2_global.zh", "start": 99546, "end": 109098}, {"filename": "/headers/ghost_zh/2.8/ghost2_init.zh", "start": 109098, "end": 114764}, {"filename": "/headers/ghost_zh/2.8/ghost2_modification.zh", "start": 114764, "end": 118917}, {"filename": "/headers/ghost_zh/2.8/ghost2_movement.zh", "start": 118917, "end": 150961}, {"filename": "/headers/ghost_zh/2.8/ghost2_other.zh", "start": 150961, "end": 170498}, {"filename": "/headers/ghost_zh/2.8/ghost2_scripts.zs", "start": 170498, "end": 170987}, {"filename": "/headers/ghost_zh/2.8/ghost2_update.zh", "start": 170987, "end": 194092}, {"filename": "/headers/ghost_zh/2.8/ghost_experimental.zh", "start": 194092, "end": 194317}, {"filename": "/headers/gui.zh", "start": 194317, "end": 195820}, {"filename": "/headers/gui_zh/guizh_button.zh", "start": 195820, "end": 197557}, {"filename": "/headers/gui_zh/guizh_checkbox.zh", "start": 197557, "end": 199516}, {"filename": "/headers/gui_zh/guizh_common.zh", "start": 199516, "end": 199731}, {"filename": "/headers/gui_zh/guizh_event.zh", "start": 199731, "end": 200544}, {"filename": "/headers/gui_zh/guizh_label.zh", "start": 200544, "end": 201351}, {"filename": "/headers/gui_zh/guizh_main.zh", "start": 201351, "end": 206631}, {"filename": "/headers/gui_zh/guizh_radioButton.zh", "start": 206631, "end": 209949}, {"filename": "/headers/gui_zh/guizh_root.zh", "start": 209949, "end": 210331}, {"filename": "/headers/gui_zh/guizh_spinner.zh", "start": 210331, "end": 212327}, {"filename": "/headers/gui_zh/guizh_types.zh", "start": 212327, "end": 214965}, {"filename": "/headers/gui_zh/guizh_widget.zh", "start": 214965, "end": 217500}, {"filename": "/headers/gui_zh/guizh_window.zh", "start": 217500, "end": 218825}, {"filename": "/headers/tango.zh", "start": 218825, "end": 225718}, {"filename": "/headers/tango/1.3/tango_access.zh", "start": 225718, "end": 228205}, {"filename": "/headers/tango/1.3/tango_common.zh", "start": 228205, "end": 236189}, {"filename": "/headers/tango/1.3/tango_deprecated.zh", "start": 236189, "end": 236398}, {"filename": "/headers/tango/1.3/tango_drawing.zh", "start": 236398, "end": 249212}, {"filename": "/headers/tango/1.3/tango_font.zh", "start": 249212, "end": 250071}, {"filename": "/headers/tango/1.3/tango_functions.zh", "start": 250071, "end": 271726}, {"filename": "/headers/tango/1.3/tango_loading.zh", "start": 271726, "end": 291961}, {"filename": "/headers/tango/1.3/tango_loggingFull.zh", "start": 291961, "end": 300372}, {"filename": "/headers/tango/1.3/tango_loggingMinimal.zh", "start": 300372, "end": 300915}, {"filename": "/headers/tango/1.3/tango_menu.zh", "start": 300915, "end": 320655}, {"filename": "/headers/tango/1.3/tango_messages.zh", "start": 320655, "end": 322817}, {"filename": "/headers/tango/1.3/tango_metrics.zh", "start": 322817, "end": 325074}, {"filename": "/headers/tango/1.3/tango_processing.zh", "start": 325074, "end": 353409}, {"filename": "/headers/tango/1.3/tango_script.zs", "start": 353409, "end": 353725}, {"filename": "/headers/tango/1.3/tango_stringControlCode.zh", "start": 353725, "end": 358596}, {"filename": "/headers/tango/1.3/tango_stringControlCodeDisabled.zh", "start": 358596, "end": 358915}, {"filename": "/headers/tango/1.3/tango_style.zh", "start": 358915, "end": 365328}, {"filename": "/headers/tango/1.3/tango_user.zh", "start": 365328, "end": 379415}, {"filename": "/headers/tango/1.3/tango_validation.zh", "start": 379415, "end": 388136}, {"filename": "/headers/tango/font/tango_Allegro.zh", "start": 388136, "end": 388398}, {"filename": "/headers/tango/font/tango_GUI.zh", "start": 388398, "end": 389894}, {"filename": "/headers/tango/font/tango_GUIBold.zh", "start": 389894, "end": 391391}, {"filename": "/headers/tango/font/tango_GUINarrow.zh", "start": 391391, "end": 392881}, {"filename": "/headers/tango/font/tango_LA.zh", "start": 392881, "end": 393906}, {"filename": "/headers/tango/font/tango_LttP.zh", "start": 393906, "end": 395374}, {"filename": "/headers/tango/font/tango_LttPSmall.zh", "start": 395374, "end": 397054}, {"filename": "/headers/tango/font/tango_Matrix.zh", "start": 397054, "end": 397510}, {"filename": "/headers/tango/font/tango_NES.zh", "start": 397510, "end": 397795}, {"filename": "/headers/tango/font/tango_Oracle.zh", "start": 397795, "end": 398090}, {"filename": "/headers/tango/font/tango_OracleProportional.zh", "start": 398090, "end": 399604}, {"filename": "/headers/tango/font/tango_Phantom.zh", "start": 399604, "end": 399866}, {"filename": "/headers/tango/font/tango_PhantomProportional.zh", "start": 399866, "end": 401427}, {"filename": "/headers/tango/font/tango_SS3.zh", "start": 401427, "end": 402911}, {"filename": "/headers/tango/font/tango_Small.zh", "start": 402911, "end": 403159}, {"filename": "/headers/tango/font/tango_Small2.zh", "start": 403159, "end": 403412}, {"filename": "/headers/tango/font/tango_SmallProportional.zh", "start": 403412, "end": 404914}, {"filename": "/include/EmilyMisc.zh", "start": 404914, "end": 455709}, {"filename": "/include/bindings.zh", "start": 455709, "end": 460087}, {"filename": "/include/bindings/audio.zh", "start": 460087, "end": 471409}, {"filename": "/include/bindings/bitmap.zh", "start": 471409, "end": 493150}, {"filename": "/include/bindings/bottledata.zh", "start": 493150, "end": 494464}, {"filename": "/include/bindings/bottleshopdata.zh", "start": 494464, "end": 495505}, {"filename": "/include/bindings/combodata.zh", "start": 495505, "end": 514797}, {"filename": "/include/bindings/combotrigger.zh", "start": 514797, "end": 545603}, {"filename": "/include/bindings/common.zh", "start": 545603, "end": 583636}, {"filename": "/include/bindings/debug.zh", "start": 583636, "end": 584006}, {"filename": "/include/bindings/directory.zh", "start": 584006, "end": 585220}, {"filename": "/include/bindings/dmapdata.zh", "start": 585220, "end": 596229}, {"filename": "/include/bindings/dropsetdata.zh", "start": 596229, "end": 596963}, {"filename": "/include/bindings/eweapon.zh", "start": 596963, "end": 606210}, {"filename": "/include/bindings/ffc.zh", "start": 606210, "end": 609770}, {"filename": "/include/bindings/file.zh", "start": 609770, "end": 615426}, {"filename": "/include/bindings/filesystem.zh", "start": 615426, "end": 616446}, {"filename": "/include/bindings/game.zh", "start": 616446, "end": 670047}, {"filename": "/include/bindings/genericdata.zh", "start": 670047, "end": 672043}, {"filename": "/include/bindings/global.zh", "start": 672043, "end": 697277}, {"filename": "/include/bindings/graphics.zh", "start": 697277, "end": 701035}, {"filename": "/include/bindings/hero.zh", "start": 701035, "end": 732171}, {"filename": "/include/bindings/input.zh", "start": 732171, "end": 738998}, {"filename": "/include/bindings/itemdata.zh", "start": 738998, "end": 766214}, {"filename": "/include/bindings/itemsprite.zh", "start": 766214, "end": 770253}, {"filename": "/include/bindings/lweapon.zh", "start": 770253, "end": 781231}, {"filename": "/include/bindings/mapdata.zh", "start": 781231, "end": 808928}, {"filename": "/include/bindings/messagedata.zh", "start": 808928, "end": 814549}, {"filename": "/include/bindings/musicdata.zh", "start": 814549, "end": 819046}, {"filename": "/include/bindings/npc.zh", "start": 819046, "end": 847983}, {"filename": "/include/bindings/npcdata.zh", "start": 847983, "end": 859418}, {"filename": "/include/bindings/paldata.zh", "start": 859418, "end": 865597}, {"filename": "/include/bindings/portal.zh", "start": 865597, "end": 866679}, {"filename": "/include/bindings/qrs.zh", "start": 866679, "end": 989353}, {"filename": "/include/bindings/randgen.zh", "start": 989353, "end": 991457}, {"filename": "/include/bindings/region.zh", "start": 991457, "end": 995533}, {"filename": "/include/bindings/save_menu.zh", "start": 995533, "end": 1001802}, {"filename": "/include/bindings/savedportal.zh", "start": 1001802, "end": 1002808}, {"filename": "/include/bindings/screendata.zh", "start": 1002808, "end": 1055301}, {"filename": "/include/bindings/shopdata.zh", "start": 1055301, "end": 1056009}, {"filename": "/include/bindings/sprite.zh", "start": 1056009, "end": 1067077}, {"filename": "/include/bindings/spritedata.zh", "start": 1067077, "end": 1068194}, {"filename": "/include/bindings/stack.zh", "start": 1068194, "end": 1071189}, {"filename": "/include/bindings/subscreendata.zh", "start": 1071189, "end": 1088186}, {"filename": "/include/bindings/subscreenpage.zh", "start": 1088186, "end": 1090521}, {"filename": "/include/bindings/subscreenwidget.zh", "start": 1090521, "end": 1116841}, {"filename": "/include/bindings/text.zh", "start": 1116841, "end": 1118381}, {"filename": "/include/bindings/viewport.zh", "start": 1118381, "end": 1120871}, {"filename": "/include/bindings/websocket.zh", "start": 1120871, "end": 1123358}, {"filename": "/include/bindings/zinfo.zh", "start": 1123358, "end": 1123744}, {"filename": "/include/deprecated/sram.zh", "start": 1123744, "end": 1125669}, {"filename": "/include/deprecated/theRandomHeader.zh", "start": 1125669, "end": 1156392}, {"filename": "/include/deprecated/time.zh", "start": 1156392, "end": 1165148}, {"filename": "/include/ffcscript.zh", "start": 1165148, "end": 1165193}, {"filename": "/include/std.zh", "start": 1165193, "end": 1165841}, {"filename": "/include/std_zh/ghostBasedMovement.zh", "start": 1165841, "end": 1175433}, {"filename": "/include/std_zh/limits.zh", "start": 1175433, "end": 1177543}, {"filename": "/include/std_zh/script_runners.zh", "start": 1177543, "end": 1184744}, {"filename": "/include/std_zh/std.cfg", "start": 1184744, "end": 1186428}, {"filename": "/include/std_zh/std_constants.zh", "start": 1186428, "end": 1203165}, {"filename": "/include/std_zh/std_extension.zh", "start": 1203165, "end": 1274134}, {"filename": "/include/std_zh/std_functions.zh", "start": 1274134, "end": 1360477}, {"filename": "/include/std_zh/std_keyboard.zh", "start": 1360477, "end": 1371305}, {"filename": "/include/std_zh/std_sideview.zh", "start": 1371305, "end": 1374203}, {"filename": "/include/std_zh/std_time.zh", "start": 1374203, "end": 1375791}, {"filename": "/include/std_zh/string/string_constants.zh", "start": 1375791, "end": 1389738}, {"filename": "/include/std_zh/string/string_functions.zh", "start": 1389738, "end": 1405650}, {"filename": "/include/string.zh", "start": 1405650, "end": 1405830}], "remote_package_size": 1405830, "package_uuid": "sha256-dffbba283a0236f27c2a6c60e3ffe887fdb8e0d62f75f426d687e36f255c8f60"});

  })();

export default Module;