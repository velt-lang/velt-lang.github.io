/** Home page code samples, hand-highlighted (see src/components/Hl.tsx for the markers). */

/**
 * src/main.velt of a package that depends on http-server (as `velt new <name>
 * --template api` sets it up). Check changes with `velt check` in such a package.
 */
export const SERVER_TS = `[[k:import]] { serve } [[k:from]] [[s:"http-server"]];

[[k:interface]] [[t:User]] {
  id: [[t:string]];
  name: [[t:string]];
}

[[k:const]] users = [[k:new]] [[t:Map]]<[[t:string]], [[t:User]]>();
users.[[f:set]]([[s:"42"]], { id: [[s:"42"]], name: [[s:"Ada"]] });

[[k:await]] [[f:serve]]({ port: [[n:8080]] }, (req: [[t:Request]]): [[t:Response]] => {
  [[k:const]] id = [[k:new]] [[t:URL]](req.url).searchParams.[[f:get]]([[s:"id"]]) ?? [[s:""]];
  [[k:const]] user = users.[[f:get]](id);
  [[k:if]] (user === [[k:undefined]]) {
    [[k:return]] [[t:Response]].[[f:json]]({ error: [[s:\`no user \${id}\`]] }, { status: [[n:404]] });
  }
  [[k:return]] [[t:Response]].[[f:json]](user);
});`;


export const TERMINAL = `[[c:$]] velt new hello [[c:   # --template api | cli | websocket | lib]]
[[c:$]] cd hello
[[c:$]] velt run        [[c:# build and run src/main.velt]]
[[c:$]] velt dev        [[c:# hot-swap your changes on every save]]
[[c:$]] velt test       [[c:# run the tests]]
[[c:$]] velt fmt        [[c:# format the code]]
[[c:$]] velt build --release
[[t:  ✓ target/velt/hello]]  [[c:native executable]]`;
