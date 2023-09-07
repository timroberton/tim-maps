import { join } from "./deps.ts";

///////////////////////////////////////////////////////////////////////////////
//  __       __            __                                  __            //
// /  |  _  /  |          /  |                                /  |           //
// $$ | / \ $$ |  ______  $$ |____         __    __   ______  $$ |  _______  //
// $$ |/$  \$$ | /      \ $$      \       /  |  /  | /      \ $$ | /       | //
// $$ /$$$  $$ |/$$$$$$  |$$$$$$$  |      $$ |  $$ |/$$$$$$  |$$ |/$$$$$$$/  //
// $$ $$/$$ $$ |$$    $$ |$$ |  $$ |      $$ |  $$ |$$ |  $$/ $$ |$$      \  //
// $$$$/  $$$$ |$$$$$$$$/ $$ |__$$ |      $$ \__$$ |$$ |      $$ | $$$$$$  | //
// $$$/    $$$ |$$       |$$    $$/       $$    $$/ $$ |      $$ |/     $$/  //
// $$/      $$/  $$$$$$$/ $$$$$$$/         $$$$$$/  $$/       $$/ $$$$$$$/   //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

export async function fetchJsonFile<T>(
  baseUrl: string,
  relPath: string
): Promise<T | undefined> {
  try {
    const url = `${baseUrl}/${relPath}`;
    return await (await fetch(url)).json().catch(() => {
      return undefined;
    });
  } catch {
    return undefined;
  }
}
export async function fetchUint8File(
  baseUrl: string,
  relPath: string
): Promise<Uint8Array | undefined> {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Uint8Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return undefined;
  }
}
export async function fetchInt16File(
  baseUrl: string,
  relPath: string
): Promise<Int16Array | undefined> {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Int16Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return undefined;
  }
}
export async function fetchInt32File(
  baseUrl: string,
  relPath: string
): Promise<Int32Array | undefined> {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Int32Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return undefined;
  }
}
export async function fetchFloat32File(
  baseUrl: string,
  relPath: string
): Promise<Float32Array | undefined> {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Float32Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return undefined;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//  ________  __  __                                                  __                              //
// /        |/  |/  |                                                /  |                             //
// $$$$$$$$/ $$/ $$ |  ______          _______  __    __   _______  _$$ |_     ______   _____  ____   //
// $$ |__    /  |$$ | /      \        /       |/  |  /  | /       |/ $$   |   /      \ /     \/    \  //
// $$    |   $$ |$$ |/$$$$$$  |      /$$$$$$$/ $$ |  $$ |/$$$$$$$/ $$$$$$/   /$$$$$$  |$$$$$$ $$$$  | //
// $$$$$/    $$ |$$ |$$    $$ |      $$      \ $$ |  $$ |$$      \   $$ | __ $$    $$ |$$ | $$ | $$ | //
// $$ |      $$ |$$ |$$$$$$$$/        $$$$$$  |$$ \__$$ | $$$$$$  |  $$ |/  |$$$$$$$$/ $$ | $$ | $$ | //
// $$ |      $$ |$$ |$$       |      /     $$/ $$    $$ |/     $$/   $$  $$/ $$       |$$ | $$ | $$ | //
// $$/       $$/ $$/  $$$$$$$/       $$$$$$$/   $$$$$$$ |$$$$$$$/     $$$$/   $$$$$$$/ $$/  $$/  $$/  //
//                                             /  \__$$ |                                             //
//                                             $$    $$/                                              //
//                                              $$$$$$/                                               //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function readJsonFile<T>(
  ...pathArgs: string[]
): Promise<T | undefined> {
  try {
    return JSON.parse(await Deno.readTextFile(join(...pathArgs)));
  } catch {
    return undefined;
  }
}
export async function readUint8File(
  ...pathArgs: string[]
): Promise<Uint8Array | undefined> {
  try {
    return await Deno.readFile(join(...pathArgs));
  } catch {
    return undefined;
  }
}
export async function readInt16File(
  ...pathArgs: string[]
): Promise<Int16Array | undefined> {
  try {
    return new Int16Array((await Deno.readFile(join(...pathArgs))).buffer);
  } catch {
    return undefined;
  }
}
export async function readInt32File(
  ...pathArgs: string[]
): Promise<Int32Array | undefined> {
  try {
    return new Int32Array((await Deno.readFile(join(...pathArgs))).buffer);
  } catch {
    return undefined;
  }
}
export async function readFloat32File(
  ...pathArgs: string[]
): Promise<Float32Array | undefined> {
  try {
    return new Float32Array((await Deno.readFile(join(...pathArgs))).buffer);
  } catch {
    return undefined;
  }
}
