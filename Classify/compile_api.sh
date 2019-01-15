#!/bin/bash

protoc \
	--proto_path=protos \
	--proto_path=../googleapis/ \
	--include_imports \
	--include_source_info \
	--descriptor_set_out api.pb \
	classify_rest.proto;
	
echo "api.pb file was created";


protoc 	--proto_path=protos --js_out=import_style=commonjs,binary:src/models classify.proto;