/** Home page code samples, hand-highlighted (see src/components/Hl.tsx for the markers). */

export const SERVER_TS = `[[k:import]] { serve } [[k:from]] [[s:"velt:http"]];

[[k:interface]] [[t:User]] {
  id: [[t:string]];
  name: [[t:string]];
}

[[k:async function]] [[f:main]]() {
  [[k:const]] users = [[k:new]] [[t:Map]]<[[t:string]], [[t:User]]>();
  users.[[f:set]]([[s:"42"]], { id: [[s:"42"]], name: [[s:"Ada"]] });

  [[k:await]] [[f:serve]]({ port: [[n:8080]] }, [[k:async]] (req) => {
    [[k:const]] id = [[k:new]] [[t:URL]](req.url).searchParams.[[f:get]]([[s:"id"]]) ?? [[s:""]];
    [[k:const]] user = users.[[f:get]](id);
    [[k:if]] (user === [[k:undefined]]) {
      [[k:return]] [[t:Response]].[[f:json]]({ error: [[s:\`no user \${id}\`]] }, { status: [[n:404]] });
    }
    [[k:return]] [[t:Response]].[[f:json]](user);
  });
}`;

export const BEYOND_VLT = `[[k:class]] [[t:NotFound]] [[k:extends]] [[t:Error]] {}

[[c:// Errors are part of the type.]]
[[k:function]] [[f:findUser]](id: [[t:string]]): [[t:string]] [[k:throws]] [[t:NotFound]] {
  [[k:if]] (id !== [[s:"42"]]) [[k:throw new]] [[t:NotFound]]([[s:\`no user \${id}\`]]);
  [[k:return]] [[s:"Ada"]];
}

[[c:// Real integer types: u32 wraps as in C or Rust.]]
[[k:function]] [[f:fnv1a]](text: [[t:string]]): [[t:u32]] {
  [[k:let]] hash: [[t:u32]] = [[n:2166136261]];
  [[k:for]] ([[k:let]] i = [[n:0]]; i < text.length; i++) {
    hash = (hash ^ (text.[[f:charCodeAt]](i) [[k:as]] [[t:u32]])) * [[n:16777619]];
  }
  [[k:return]] hash;
}

[[c:// Four tasks on four cores.]]
[[k:const]] parts: [[t:Promise]]<[[t:i64]]>[] = [];
[[k:for]] ([[k:let]] c = [[n:0]]; c < [[n:4]]; c++) {
  parts.[[f:push]]([[f:spawn]]([[k:async]] () => [[f:sumOfSquares]](c * [[n:1e6]], (c + [[n:1]]) * [[n:1e6]])));
}
[[k:await]] [[t:Promise]].[[f:all]](parts);`;

export const TERMINAL = `[[c:$]] velt new hello [[c:   # --template api | cli | websocket | lib]]
[[c:$]] cd hello
[[c:$]] velt run        [[c:# build and run src/main.vlt]]
[[c:$]] velt dev        [[c:# hot-swap your changes on every save]]
[[c:$]] velt test       [[c:# run the tests]]
[[c:$]] velt fmt        [[c:# format the code]]
[[c:$]] velt build --release
[[t:  ✓ target/velt/hello]]  [[c:native executable]]`;
