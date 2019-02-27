{
  "targets": [
    { 
      "target_name": "rfOn",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/rfOn.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "rfOff",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/rfOff.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setPower",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setPower.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "getPower",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/getPower.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "resetAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/resetAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setRefLevel",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setRefLevel.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setUpOIP3",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setUpOIP3.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setDownOIP3",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setDownOIP3.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    }
  ]
}