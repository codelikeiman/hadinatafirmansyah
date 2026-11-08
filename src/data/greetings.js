// Sapaan polyglot untuk intro splash (dipindah dari App.jsx lama, isi tidak diubah).
export const GREETING_LANGS = [
  { lang: "Python", code: `def main():
    print("halo, saya firmansyah")

if __name__ == "__main__":
    main()` },
  { lang: "JavaScript", code: `function main() {
  console.log("halo, saya firmansyah");
}

main();` },
  { lang: "TypeScript", code: `function main(): void {
  const message: string = "halo, saya firmansyah";
  console.log(message);
}

main();` },
  { lang: "Java", code: `public class Main {
    public static void main(String[] args) {
        System.out.println("halo, saya firmansyah");
    }
}` },
  { lang: "C", code: `#include <stdio.h>

int main() {
    printf("halo, saya firmansyah\\n");
    return 0;
}` },
  { lang: "C++", code: `#include <iostream>

int main() {
    std::cout << "halo, saya firmansyah" << std::endl;
    return 0;
}` },
  { lang: "C#", code: `using System;

class Program {
    static void Main() {
        Console.WriteLine("halo, saya firmansyah");
    }
}` },
  { lang: "Go", code: `package main

import "fmt"

func main() {
    fmt.Println("halo, saya firmansyah")
}` },
  { lang: "Rust", code: `fn main() {
    println!("halo, saya firmansyah");
}` },
  { lang: "Ruby", code: `def main
  puts "halo, saya firmansyah"
end

main` },
  { lang: "PHP", code: `<?php

function main() {
    echo "halo, saya firmansyah";
}

main();` },
  { lang: "Swift", code: `import Foundation

func main() {
    print("halo, saya firmansyah")
}

main()` },
  { lang: "Kotlin", code: `fun main() {
    println("halo, saya firmansyah")
}` },
  { lang: "Dart", code: `void main() {
  print('halo, saya firmansyah');
}` },
  { lang: "Bash", code: `#!/bin/bash

echo "halo, saya firmansyah"` },
  { lang: "SQL", code: `SELECT 'halo, saya firmansyah' AS greeting;` },
  { lang: "Lua", code: `local function main()
    print("halo, saya firmansyah")
end

main()` },
  { lang: "Perl", code: `#!/usr/bin/perl
use strict;
use warnings;

print "halo, saya firmansyah\\n";` },
  { lang: "Haskell", code: `module Main where

main :: IO ()
main = putStrLn "halo, saya firmansyah"` },
  { lang: "Scala", code: `object Main {
  def main(args: Array[String]): Unit = {
    println("halo, saya firmansyah")
  }
}` },
  { lang: "R", code: `main <- function() {
  print("halo, saya firmansyah")
}

main()` },
  { lang: "MATLAB", code: `disp('halo, saya firmansyah')` },
  { lang: "Elixir", code: `defmodule Main do
  def run do
    IO.puts("halo, saya firmansyah")
  end
end

Main.run()` },
  { lang: "Julia", code: `function main()
    println("halo, saya firmansyah")
end

main()` },
  { lang: "F#", code: `[<EntryPoint>]
let main argv =
    printfn "halo, saya firmansyah"
    0` },
  { lang: "Clojure", code: `(defn main []
  (println "halo, saya firmansyah"))

(main)` },
  { lang: "Objective-C", code: `#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSLog(@"halo, saya firmansyah");
    }
    return 0;
}` },
  { lang: "VB.NET", code: `Module Program
    Sub Main()
        Console.WriteLine("halo, saya firmansyah")
    End Sub
End Module` },
  { lang: "Pascal", code: `program Main;
begin
    writeln('halo, saya firmansyah');
end.` },
  { lang: "Fortran", code: `program main
    print *, "halo, saya firmansyah"
end program main` },
  { lang: "Scheme", code: `(define (main)
  (display "halo, saya firmansyah")
  (newline))

(main)` },
  { lang: "Nim", code: `proc main() =
  echo "halo, saya firmansyah"

main()` },
  { lang: "Groovy", code: `println "halo, saya firmansyah"` },
  { lang: "PowerShell", code: `function Main {
    Write-Host "halo, saya firmansyah"
}

Main` },
  { lang: "Erlang", code: `-module(main).
-export([start/0]).

start() ->
    io:format("halo, saya firmansyah~n").` },
  { lang: "Crystal", code: `def main
  puts "halo, saya firmansyah"
end

main` },
  { lang: "COBOL", code: `IDENTIFICATION DIVISION.
PROGRAM-ID. MAIN.
PROCEDURE DIVISION.
    DISPLAY "halo, saya firmansyah".
    STOP RUN.` },
  { lang: "Zig", code: `const std = @import("std");

pub fn main() void {
    std.debug.print("halo, saya firmansyah\\n", .{});
}` },
];

export const GREETING_PHRASE = "halo, saya firmansyah";
