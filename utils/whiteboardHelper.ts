import { Camera, Vector2, Vector3 } from 'three';

export function appendRect() {}

/**
 * Generate object id
 *
 * @return {number} Generated object id based on current time
 */
export function genId(): string {
  return (new Date().getTime() * Math.random()).toString();
}

/**
 * Generate depth value
 *
 * @return {number} Generated depth value. Used to solve z-index fighting
 */
let depth = 0;
export function genDepth(): number {
  return (depth += 0.0001);
}

/**
 * Generate random color
 *
 * @return {string} Generated random color value in rgb string
 */
export function genColor(): string {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255,
  )})`;
}

/**
 * Create Rectangle Object based on input parameter
 *
 * @param {number} [x] x position
 * @param {number} [y] y position
 * @param {number} [w] width value
 * @param {number} [h] height value
 * @param {string} [color=genColor()] rgb string
 * @param {number} [depth=genDepth()] depth value
 * @return {RectObj} generated Rectangle Object based on input parameter
 */
export function createRect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = genColor(),
  depth: number = genDepth(),
): RectObj {
  return {
    objId: genId(),
    type: 'RECT',
    x: x,
    y: y,
    w: w,
    h: h,
    depth: depth,
    color: color,
    parentId: 'root',
  };
}

/**
 * Returns real position of mouse inside canvas
 *
 * @param {Vector2} [mouse] target mouse object to find coordinates of
 * @param {Camera} [camera] camera object to find coordinates with
 * @return {RectObj} generated Rectangle Object based on input parameter
 */
const vector3 = new Vector3();
export function getPos(mouse: Vector2, camera: Camera) {
  const { x, y } = vector3.set(mouse.x, mouse.y, 0).unproject(camera);
  return { x, y };
}

/**
 * Construct and return ObjTree based on ObjMap input
 *
 * @param {Map<string, Obj>} [objMap] Map of all objects
 * @return {ObjNode} Root node of constructed objTree
 */
export function constructRootObjTree(objMap: Map<string, Obj>): ObjNode {
  const dependencyMap = new Map<string, string[]>();
  const blank: string[] = [];

  for (const [_, v] of objMap) {
    dependencyMap.set(v.parentId, [...(dependencyMap.get(v.parentId) || blank), v.objId]);
  }

  const root: ObjNode = {
    objId: 'ROOT',
    childNodes: [],
  };

  const stack: ObjNode[] = [root];

  while (stack.length > 0) {
    const parent = stack.pop()!;

    const nextIds = dependencyMap.get(parent.objId);
    if (nextIds === undefined) continue;
    for (const id of nextIds) {
      const child: ObjNode = { objId: id, childNodes: [] };
      parent.childNodes.push(child);
      stack.push(child);
    }
  }

  console.log(root);

  return root;
}

export const lipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar, nulla quis viverra venenatis, metus sapien blandit urna, nec tristique sem justo non justo. Pellentesque semper massa nec dapibus luctus. Vestibulum facilisis ornare augue vel semper. Pellentesque id faucibus augue. Quisque ullamcorper tempor magna eget molestie. Etiam mattis a velit quis porttitor. Sed et posuere sapien, non convallis elit. Mauris tempor, metus non auctor accumsan, ante lacus posuere augue, ac scelerisque sem nunc luctus arcu. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus sed dapibus risus, non tristique mi. Quisque vel euismod tellus. Pellentesque sit amet porttitor massa. Maecenas erat mi, eleifend a eleifend non, malesuada eget purus. Mauris ac enim lobortis nulla consequat elementum. Donec imperdiet, metus sed auctor bibendum, eros nulla blandit purus, vel convallis odio nulla id dui. Ut condimentum diam ut turpis tempus, a rhoncus arcu convallis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec lacinia elementum ex vitae vestibulum. Sed id est ultricies neque fermentum hendrerit. Duis molestie velit id eleifend ornare.
Etiam augue metus, venenatis eget facilisis ut, ornare ut elit. Morbi in sodales velit, in sollicitudin ligula. Donec ac ex pulvinar dolor elementum eleifend. Suspendisse eget tempus arcu. Quisque id vestibulum magna, ac sodales purus. Integer pulvinar lectus pulvinar, aliquet ipsum vel, iaculis nisl. Quisque maximus diam quis eros eleifend commodo.
Fusce molestie metus a nulla blandit bibendum. Aliquam at nunc non metus condimentum mollis. Ut elementum justo aliquet nibh mollis, a interdum urna iaculis. Fusce tempus nisi tristique urna laoreet, id facilisis nibh fermentum. Integer quis massa dolor. Mauris imperdiet mattis odio, eget fermentum turpis mattis nec. Mauris aliquet est mi, vel posuere sem accumsan id. Sed rutrum, magna sed feugiat faucibus, ante ante placerat erat, at dapibus lorem est eget nulla. Aenean id scelerisque lorem, eu tristique dui. Nam ornare est ac velit dictum vulputate quis at ex. Curabitur nec massa vel purus luctus ullamcorper eu in orci. In nec rhoncus tellus.
Pellentesque ac blandit sem. Aliquam sed fringilla lorem. Nulla sollicitudin massa ac auctor condimentum. Morbi velit magna, hendrerit id enim sit amet, malesuada ornare eros. Vestibulum laoreet diam ac leo hendrerit placerat. Nulla nec sem et eros posuere fermentum nec a purus. Donec elementum, sem quis auctor commodo, purus nibh lacinia justo, sed porttitor est elit non nulla. Etiam cursus dolor sit amet sem ornare tristique. Nam nisl sem, porttitor blandit dui sed, auctor luctus erat. Etiam nec aliquet diam. Proin tristique erat vitae nisi vestibulum dapibus in sed ligula. Praesent efficitur tellus et arcu fermentum, ut convallis augue interdum. In blandit orci sed nisl pharetra placerat. Sed consequat metus non nisl congue efficitur. Duis et vulputate ante.
Proin mollis erat ut sem posuere luctus. Mauris consectetur ligula nibh, non dignissim arcu convallis quis. Maecenas sollicitudin porttitor massa eu faucibus. Aenean fermentum facilisis lobortis. Integer feugiat augue ut nulla eleifend ornare. Vestibulum non condimentum nisl, pharetra fermentum sem. Mauris nec ante felis. Nam pharetra lobortis nunc, at gravida est placerat vitae.
In scelerisque vitae tortor id convallis. Proin sit amet dui eget est dictum volutpat. Quisque diam metus, condimentum sed sem in, elementum feugiat tellus. Aenean nec magna a leo congue bibendum et at nulla. Nam non feugiat neque. Sed in bibendum elit. Ut venenatis, sapien quis interdum blandit, arcu ante tempor tellus, ut sollicitudin nulla mi a orci. Interdum et malesuada fames ac ante ipsum primis in faucibus.
Praesent sit amet libero gravida, hendrerit lorem ut, laoreet leo. Quisque vitae fermentum est, eu lobortis ante. In et venenatis eros. Curabitur vitae bibendum velit. Donec ut massa mauris. Praesent non mi et erat aliquam volutpat. Duis at commodo justo. Aenean porta malesuada velit.
Quisque vitae diam ac mauris posuere egestas et id quam. Pellentesque et egestas ante. Etiam vel faucibus orci, non pellentesque ex. Maecenas nec tincidunt odio, at tincidunt lectus. Morbi ligula tortor, volutpat id magna et, scelerisque mattis augue. Suspendisse elementum ac libero vitae venenatis. Aliquam erat volutpat. Aliquam convallis purus nec velit faucibus, at porta tellus ultrices. Phasellus suscipit lectus vel sapien rutrum cursus id non odio. Curabitur eget ex rhoncus, mattis erat non, feugiat ex. Donec id lacus et tortor accumsan sollicitudin in sit amet tellus.
Proin lacinia placerat elit at pretium. Donec efficitur tortor id ex placerat, eget malesuada dolor egestas. Nullam bibendum mollis lacus nec condimentum. Morbi lacinia eget nisl sit amet laoreet. Duis consequat mattis nisl, at luctus eros porttitor ut. Nullam bibendum enim vitae est lacinia, faucibus dapibus diam tempor. Duis nec arcu a mi mollis efficitur. Aliquam non laoreet quam. Vivamus ipsum nunc, semper ultricies nisi sit amet, pellentesque tincidunt enim. Donec ultricies urna congue orci dictum, sed elementum neque hendrerit. Cras vel tempus mauris, vitae consectetur magna. Morbi vel rutrum quam, sed blandit ligula.
Quisque commodo, enim et gravida venenatis, erat neque laoreet eros, sed sollicitudin justo ante malesuada magna. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce velit est, hendrerit sed orci ac, luctus eleifend quam. Nam a tincidunt urna, ut ultricies massa. Donec semper purus aliquam, venenatis magna eu, gravida nunc. Proin luctus pulvinar hendrerit. Proin lorem tellus, blandit blandit orci nec, euismod hendrerit velit. Sed aliquam lacus ac justo fermentum aliquam in quis ante.
In hac habitasse platea dictumst. Nullam non nunc metus. Sed vitae felis ligula. Nullam scelerisque placerat mauris in laoreet. Maecenas pulvinar, lectus sed maximus iaculis, dolor neque tempus metus, non commodo nibh nibh eleifend orci. Suspendisse potenti. Nam volutpat efficitur nisl, vel vestibulum ligula pulvinar sed. Maecenas id tellus non ipsum aliquam imperdiet. Aenean vulputate, ante nec egestas fermentum, lacus libero scelerisque risus, non maximus leo metus at lorem. Phasellus sodales lacinia arcu, id pretium urna mattis in. Aliquam at fringilla tortor. Quisque bibendum neque ac augue ultricies consequat. Duis massa elit, interdum at tincidunt a, fermentum et justo. Sed sit amet porta sem.
In aliquet euismod euismod. Donec lacinia id ligula quis mattis. Cras placerat tempus nulla, vitae auctor ex sodales ut. Fusce lorem diam, dapibus eu tempus nec, vestibulum eget eros. Nullam interdum tincidunt justo, egestas blandit mi venenatis eget. Etiam nec sem rutrum felis pharetra posuere. Fusce quis porttitor elit. Aliquam imperdiet est sed nibh egestas, commodo efficitur magna varius. Vivamus laoreet ex ac purus viverra rutrum. Fusce pharetra enim sed porttitor efficitur. Aliquam lobortis cursus vehicula. Nunc gravida libero sit amet convallis malesuada. Vestibulum sit amet nunc sit amet justo ullamcorper consectetur non sit amet arcu. Pellentesque suscipit metus a dignissim commodo. In hac habitasse platea dictumst.
Maecenas venenatis porta aliquam. Pellentesque sit amet leo dignissim, eleifend ex sit amet, efficitur massa. Nunc eu pellentesque sapien. Nam ac dui nibh. Integer quis sollicitudin quam. Donec elementum nisi sit amet magna sollicitudin fringilla. Pellentesque viverra nulla nec lectus volutpat sodales. Nam viverra molestie ante at venenatis. Cras nec sagittis purus, facilisis pretium est. Sed sapien ante, sagittis vel orci a, euismod rutrum nunc. Integer efficitur neque eu dictum condimentum. Donec quis ligula id metus bibendum vulputate sit amet vel augue. Integer placerat vitae metus dignissim varius. Nullam bibendum quam non consectetur ornare. Curabitur sed venenatis nunc.
Proin dui massa, gravida eget egestas et, hendrerit fermentum arcu. Nam a bibendum lacus, sed pharetra lacus. Sed quis velit mollis, fringilla tellus non, semper ex. Quisque sodales feugiat dui a ultricies. Proin mattis elementum ante, eget porta purus. Sed congue erat non quam congue facilisis. Suspendisse finibus urna dolor, id vestibulum quam interdum nec. Duis non tempor elit, sit amet aliquet nisi. Nam porttitor tempus felis, ultrices vestibulum diam. Aliquam mollis lectus in leo sagittis rhoncus. Praesent eu imperdiet elit, vel faucibus erat. In ac consequat purus. Nullam in maximus turpis.
Donec arcu orci, blandit sit amet libero in, tristique pellentesque purus. Duis ornare turpis lacus, sed interdum erat accumsan in. Nullam erat tellus, tincidunt eget ultrices ut, laoreet eget elit. Mauris velit ligula, egestas eu ligula non, pharetra feugiat urna. Aenean ut nisl mi. Aliquam erat volutpat. Nunc id laoreet tellus, id iaculis ipsum. Mauris facilisis sed risus nec scelerisque. Proin tellus arcu, congue in urna at, tristique porta orci. Nullam ut dolor in leo dapibus consectetur. Nam porta sem non est eleifend molestie. Nunc tempor massa nisl, et mollis orci congue quis. Donec mollis, quam quis gravida iaculis, nunc diam consectetur felis, eu tristique lorem eros rutrum elit. Etiam nec dolor pellentesque, faucibus mauris nec, blandit est.
Quisque dignissim risus quis diam dignissim condimentum. Suspendisse nec sapien non lacus pellentesque feugiat. Praesent sodales sem sapien, quis viverra nisl viverra vitae. Fusce a ligula hendrerit, consequat odio sit amet, bibendum neque. Maecenas erat augue, tincidunt eget rutrum id, tristique ut turpis. Curabitur cursus sagittis mi et mollis. Maecenas faucibus gravida quam, dictum sagittis quam fermentum nec. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In quis nibh erat. Curabitur efficitur facilisis facilisis. Sed dictum id nisl vitae consequat.
In volutpat erat vel eros hendrerit rutrum. Phasellus posuere a urna at feugiat. Duis nec lacus ut magna hendrerit finibus. Maecenas varius pellentesque est, ornare pulvinar augue ultricies sed. Morbi lacinia efficitur sem et cursus. Curabitur id fermentum erat. Sed vehicula euismod tortor, sed mollis arcu vestibulum in. Mauris ante mi, convallis egestas justo eget, placerat pellentesque justo. Sed tincidunt dapibus feugiat. Vivamus a urna tristique, imperdiet quam iaculis, feugiat erat. Mauris quis orci et eros tincidunt ultricies. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer pretium interdum tellus, vel dictum mauris venenatis id.
Nam at augue ut risus luctus tempus. Nam facilisis posuere consectetur. Curabitur neque augue, ultrices ut imperdiet a, gravida at tellus. Aenean lorem elit, finibus non est pellentesque, dictum maximus purus. In luctus venenatis convallis. Fusce nunc velit, vehicula sit amet ex vitae, interdum ornare nisl. Vestibulum quis ipsum non urna bibendum finibus. Sed cursus, libero eget bibendum tristique, purus elit fringilla magna, eu faucibus lorem ipsum at sem. Maecenas sed arcu quam.
Sed non ultricies magna. Nunc eget commodo risus. Nullam eu nibh elit. Nunc tempus mauris eget ante hendrerit malesuada. Quisque nec est vitae arcu rutrum convallis ac sit amet ligula. Quisque eget efficitur neque. Sed consectetur auctor fringilla. Nullam ultrices ornare ante id posuere.`;
