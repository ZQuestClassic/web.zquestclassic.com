
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
    loadPackage({"files": [{"filename": "/base_config/zscript.cfg", "start": 0, "end": 218}, {"filename": "/headers/examples/gui_example.zs", "start": 218, "end": 3944}, {"filename": "/headers/examples/tango_example.zs", "start": 3944, "end": 8935}, {"filename": "/headers/ghost.zh", "start": 8935, "end": 15940}, {"filename": "/headers/ghost_zh/2.8/changelog.txt", "start": 15940, "end": 26908}, {"filename": "/headers/ghost_zh/2.8/ghost2_common.zh", "start": 26908, "end": 30328}, {"filename": "/headers/ghost_zh/2.8/ghost2_deprecated.zh", "start": 30328, "end": 36346}, {"filename": "/headers/ghost_zh/2.8/ghost2_drawing.zh", "start": 36346, "end": 42484}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweapon.zh", "start": 42484, "end": 71185}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponDeath.zh", "start": 71185, "end": 78858}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponMovement.zh", "start": 78858, "end": 92754}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental.zh", "start": 92754, "end": 93812}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental2.zh", "start": 93812, "end": 94875}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental_movement.zh", "start": 94875, "end": 96928}, {"filename": "/headers/ghost_zh/2.8/ghost2_flags.zh", "start": 96928, "end": 99555}, {"filename": "/headers/ghost_zh/2.8/ghost2_global.zh", "start": 99555, "end": 109107}, {"filename": "/headers/ghost_zh/2.8/ghost2_init.zh", "start": 109107, "end": 114773}, {"filename": "/headers/ghost_zh/2.8/ghost2_modification.zh", "start": 114773, "end": 118936}, {"filename": "/headers/ghost_zh/2.8/ghost2_movement.zh", "start": 118936, "end": 150980}, {"filename": "/headers/ghost_zh/2.8/ghost2_other.zh", "start": 150980, "end": 170645}, {"filename": "/headers/ghost_zh/2.8/ghost2_scripts.zs", "start": 170645, "end": 171134}, {"filename": "/headers/ghost_zh/2.8/ghost2_update.zh", "start": 171134, "end": 194239}, {"filename": "/headers/ghost_zh/2.8/ghost_experimental.zh", "start": 194239, "end": 194464}, {"filename": "/headers/gui.zh", "start": 194464, "end": 195967}, {"filename": "/headers/gui_zh/guizh_button.zh", "start": 195967, "end": 197704}, {"filename": "/headers/gui_zh/guizh_checkbox.zh", "start": 197704, "end": 199663}, {"filename": "/headers/gui_zh/guizh_common.zh", "start": 199663, "end": 199878}, {"filename": "/headers/gui_zh/guizh_event.zh", "start": 199878, "end": 200691}, {"filename": "/headers/gui_zh/guizh_label.zh", "start": 200691, "end": 201498}, {"filename": "/headers/gui_zh/guizh_main.zh", "start": 201498, "end": 206778}, {"filename": "/headers/gui_zh/guizh_radioButton.zh", "start": 206778, "end": 210096}, {"filename": "/headers/gui_zh/guizh_root.zh", "start": 210096, "end": 210478}, {"filename": "/headers/gui_zh/guizh_spinner.zh", "start": 210478, "end": 212474}, {"filename": "/headers/gui_zh/guizh_types.zh", "start": 212474, "end": 215112}, {"filename": "/headers/gui_zh/guizh_widget.zh", "start": 215112, "end": 217647}, {"filename": "/headers/gui_zh/guizh_window.zh", "start": 217647, "end": 218972}, {"filename": "/headers/tango.zh", "start": 218972, "end": 225865}, {"filename": "/headers/tango/1.3/tango_access.zh", "start": 225865, "end": 228352}, {"filename": "/headers/tango/1.3/tango_common.zh", "start": 228352, "end": 236336}, {"filename": "/headers/tango/1.3/tango_deprecated.zh", "start": 236336, "end": 236545}, {"filename": "/headers/tango/1.3/tango_drawing.zh", "start": 236545, "end": 249362}, {"filename": "/headers/tango/1.3/tango_font.zh", "start": 249362, "end": 250221}, {"filename": "/headers/tango/1.3/tango_functions.zh", "start": 250221, "end": 271876}, {"filename": "/headers/tango/1.3/tango_loading.zh", "start": 271876, "end": 292111}, {"filename": "/headers/tango/1.3/tango_loggingFull.zh", "start": 292111, "end": 300522}, {"filename": "/headers/tango/1.3/tango_loggingMinimal.zh", "start": 300522, "end": 301065}, {"filename": "/headers/tango/1.3/tango_menu.zh", "start": 301065, "end": 320805}, {"filename": "/headers/tango/1.3/tango_messages.zh", "start": 320805, "end": 322967}, {"filename": "/headers/tango/1.3/tango_metrics.zh", "start": 322967, "end": 325224}, {"filename": "/headers/tango/1.3/tango_processing.zh", "start": 325224, "end": 353559}, {"filename": "/headers/tango/1.3/tango_script.zs", "start": 353559, "end": 353875}, {"filename": "/headers/tango/1.3/tango_stringControlCode.zh", "start": 353875, "end": 358746}, {"filename": "/headers/tango/1.3/tango_stringControlCodeDisabled.zh", "start": 358746, "end": 359065}, {"filename": "/headers/tango/1.3/tango_style.zh", "start": 359065, "end": 365478}, {"filename": "/headers/tango/1.3/tango_user.zh", "start": 365478, "end": 379565}, {"filename": "/headers/tango/1.3/tango_validation.zh", "start": 379565, "end": 388286}, {"filename": "/headers/tango/font/tango_Allegro.zh", "start": 388286, "end": 388548}, {"filename": "/headers/tango/font/tango_GUI.zh", "start": 388548, "end": 390044}, {"filename": "/headers/tango/font/tango_GUIBold.zh", "start": 390044, "end": 391541}, {"filename": "/headers/tango/font/tango_GUINarrow.zh", "start": 391541, "end": 393031}, {"filename": "/headers/tango/font/tango_LA.zh", "start": 393031, "end": 394056}, {"filename": "/headers/tango/font/tango_LttP.zh", "start": 394056, "end": 395524}, {"filename": "/headers/tango/font/tango_LttPSmall.zh", "start": 395524, "end": 397204}, {"filename": "/headers/tango/font/tango_Matrix.zh", "start": 397204, "end": 397660}, {"filename": "/headers/tango/font/tango_NES.zh", "start": 397660, "end": 397945}, {"filename": "/headers/tango/font/tango_Oracle.zh", "start": 397945, "end": 398240}, {"filename": "/headers/tango/font/tango_OracleProportional.zh", "start": 398240, "end": 399754}, {"filename": "/headers/tango/font/tango_Phantom.zh", "start": 399754, "end": 400016}, {"filename": "/headers/tango/font/tango_PhantomProportional.zh", "start": 400016, "end": 401577}, {"filename": "/headers/tango/font/tango_SS3.zh", "start": 401577, "end": 403061}, {"filename": "/headers/tango/font/tango_Small.zh", "start": 403061, "end": 403309}, {"filename": "/headers/tango/font/tango_Small2.zh", "start": 403309, "end": 403562}, {"filename": "/headers/tango/font/tango_SmallProportional.zh", "start": 403562, "end": 405064}, {"filename": "/include/EmilyMisc.zh", "start": 405064, "end": 455869}, {"filename": "/include/bindings.zh", "start": 455869, "end": 460247}, {"filename": "/include/bindings/audio.zh", "start": 460247, "end": 471467}, {"filename": "/include/bindings/bitmap.zh", "start": 471467, "end": 494012}, {"filename": "/include/bindings/bottledata.zh", "start": 494012, "end": 495348}, {"filename": "/include/bindings/bottleshopdata.zh", "start": 495348, "end": 496389}, {"filename": "/include/bindings/combodata.zh", "start": 496389, "end": 516564}, {"filename": "/include/bindings/combotrigger.zh", "start": 516564, "end": 555450}, {"filename": "/include/bindings/common.zh", "start": 555450, "end": 595105}, {"filename": "/include/bindings/debug.zh", "start": 595105, "end": 595475}, {"filename": "/include/bindings/directory.zh", "start": 595475, "end": 596689}, {"filename": "/include/bindings/dmapdata.zh", "start": 596689, "end": 607970}, {"filename": "/include/bindings/dropsetdata.zh", "start": 607970, "end": 608704}, {"filename": "/include/bindings/eweapon.zh", "start": 608704, "end": 619296}, {"filename": "/include/bindings/ffc.zh", "start": 619296, "end": 623942}, {"filename": "/include/bindings/file.zh", "start": 623942, "end": 631625}, {"filename": "/include/bindings/filesystem.zh", "start": 631625, "end": 633133}, {"filename": "/include/bindings/game.zh", "start": 633133, "end": 686829}, {"filename": "/include/bindings/genericdata.zh", "start": 686829, "end": 688825}, {"filename": "/include/bindings/global.zh", "start": 688825, "end": 714185}, {"filename": "/include/bindings/graphics.zh", "start": 714185, "end": 717943}, {"filename": "/include/bindings/hero.zh", "start": 717943, "end": 751244}, {"filename": "/include/bindings/input.zh", "start": 751244, "end": 758071}, {"filename": "/include/bindings/itemdata.zh", "start": 758071, "end": 785721}, {"filename": "/include/bindings/itemsprite.zh", "start": 785721, "end": 789976}, {"filename": "/include/bindings/lweapon.zh", "start": 789976, "end": 802299}, {"filename": "/include/bindings/mapdata.zh", "start": 802299, "end": 831040}, {"filename": "/include/bindings/messagedata.zh", "start": 831040, "end": 836661}, {"filename": "/include/bindings/musicdata.zh", "start": 836661, "end": 841228}, {"filename": "/include/bindings/npc.zh", "start": 841228, "end": 871893}, {"filename": "/include/bindings/npcdata.zh", "start": 871893, "end": 883438}, {"filename": "/include/bindings/paldata.zh", "start": 883438, "end": 889617}, {"filename": "/include/bindings/portal.zh", "start": 889617, "end": 890699}, {"filename": "/include/bindings/qrs.zh", "start": 890699, "end": 1015331}, {"filename": "/include/bindings/randgen.zh", "start": 1015331, "end": 1017435}, {"filename": "/include/bindings/region.zh", "start": 1017435, "end": 1021680}, {"filename": "/include/bindings/save_menu.zh", "start": 1021680, "end": 1028018}, {"filename": "/include/bindings/savedportal.zh", "start": 1028018, "end": 1029024}, {"filename": "/include/bindings/screendata.zh", "start": 1029024, "end": 1083198}, {"filename": "/include/bindings/shopdata.zh", "start": 1083198, "end": 1083906}, {"filename": "/include/bindings/sprite.zh", "start": 1083906, "end": 1097339}, {"filename": "/include/bindings/spritedata.zh", "start": 1097339, "end": 1098456}, {"filename": "/include/bindings/stack.zh", "start": 1098456, "end": 1101451}, {"filename": "/include/bindings/subscreendata.zh", "start": 1101451, "end": 1119603}, {"filename": "/include/bindings/subscreenpage.zh", "start": 1119603, "end": 1121938}, {"filename": "/include/bindings/subscreenwidget.zh", "start": 1121938, "end": 1149372}, {"filename": "/include/bindings/text.zh", "start": 1149372, "end": 1150912}, {"filename": "/include/bindings/viewport.zh", "start": 1150912, "end": 1153493}, {"filename": "/include/bindings/websocket.zh", "start": 1153493, "end": 1156043}, {"filename": "/include/bindings/zinfo.zh", "start": 1156043, "end": 1156451}, {"filename": "/include/deprecated/sram.zh", "start": 1156451, "end": 1158376}, {"filename": "/include/deprecated/theRandomHeader.zh", "start": 1158376, "end": 1189101}, {"filename": "/include/deprecated/time.zh", "start": 1189101, "end": 1197857}, {"filename": "/include/ffcscript.zh", "start": 1197857, "end": 1197902}, {"filename": "/include/std.zh", "start": 1197902, "end": 1198383}, {"filename": "/include/std_zh/ghostBasedMovement.zh", "start": 1198383, "end": 1207955}, {"filename": "/include/std_zh/limits.zh", "start": 1207955, "end": 1209856}, {"filename": "/include/std_zh/script_runners.zh", "start": 1209856, "end": 1217057}, {"filename": "/include/std_zh/std.cfg", "start": 1217057, "end": 1218741}, {"filename": "/include/std_zh/std_constants.zh", "start": 1218741, "end": 1235394}, {"filename": "/include/std_zh/std_extension.zh", "start": 1235394, "end": 1306489}, {"filename": "/include/std_zh/std_functions.zh", "start": 1306489, "end": 1392844}, {"filename": "/include/std_zh/std_keyboard.zh", "start": 1392844, "end": 1403672}, {"filename": "/include/std_zh/std_sideview.zh", "start": 1403672, "end": 1406570}, {"filename": "/include/std_zh/std_time.zh", "start": 1406570, "end": 1408158}, {"filename": "/include/std_zh/string/string_constants.zh", "start": 1408158, "end": 1422105}, {"filename": "/include/std_zh/string/string_functions.zh", "start": 1422105, "end": 1437986}, {"filename": "/include/string.zh", "start": 1437986, "end": 1438166}], "remote_package_size": 1438166, "package_uuid": "sha256-48f2948daf817ff09320762a99750061b1353f16d0f2f5df00b8a0b0f16c4966"});

  })();

export default Module;