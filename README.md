
This is a deno folder (workspace)

I write it as for deno in the src folder

I use esbuild to make a single js file in the dist folder
by running `sh build`

I manually add my own types to dist/index.d.ts

For browser/node projects, I import from dist

----

## Adm 1 & Adm 2

Uint8Array, bad = 0, max = 254

## Facilities location (pixels x/y)

Int32Array, bad = -9999

Length is TWICE that of nFacilities

if facility is not in the area, the two values are set to -9999

## Nearest facility ID

Int16Array, bad = -9999, max = 32,767

Values represent the facility NUMBER (i.e. starting at 1)

Values are set to -9999 if the pix has no population (i.e. if pop = -9999)
Values are set to -9999 if there are no possible facilities in the area

## Distance to nearest facility

Float32Array

Values represent the distance in KM to the nearest facility (as specified in "nearest.bin")

Values are set to -9999 if the pix has no population (i.e. if pop = -9999)
Values are set to -9999 if there are no possible facilities in the area
