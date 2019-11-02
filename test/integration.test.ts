import { DependencyTreeNode } from "../src/dependencyTreeNode";
import { Serializer } from "../src/serializer";
import { DependencyTreeVisitor } from "../src/dependencyTreeVisitor";
class Package {
    constructor(public id:string, public name:string){};
};
class MockSerializer implements Serializer<Package>{
    serialize(element: Package): string {
        return element.name;
    }
    
}
const visitor: DependencyTreeVisitor = new DependencyTreeVisitor(new MockSerializer());
const topNodePackage = new Package('0', 'A');
const l1p1 = new Package('1.1', '1st Level Dependency p#1');
const l1p2 = new Package('1.2', '1st Level Dependency p#2');
const l2p1 = new Package('2.1', '2nd Level Dependency p#1');
const l2p2 = new Package('2.2', '2nd Level Dependency p#2');
const l2p3 = new Package('2.3', '2nd Level Dependency p#3');
const l3p1 = new Package('3.1', '3rd Level Dependency p#1');
const l3p2 = new Package('3.2', '3rd Level Dependency p#2');
it(`
multi-level final test      +- 1.1
                            |  +- 2.1
                            |  +- 2.2
                            |  |  +- 3.1
                            |  |  \- 3.2
                            |  \- 2.3
                            \- 1.2
                               \- 2.2
                                  +- 3.1
                                  \- 3.2
`, () => {
    const topNode = new DependencyTreeNode<Package>(topNodePackage, null);
    const d11 = new DependencyTreeNode<Package>(l1p1, topNode);
    const d21 = new DependencyTreeNode<Package>(l2p1, d11);
    const d22 = new DependencyTreeNode<Package>(l2p2, d11);
    const d31 = new DependencyTreeNode<Package>(l3p1, d22);
    const d32 = new DependencyTreeNode<Package>(l3p2, d22);
    const d23 = new DependencyTreeNode<Package>(l2p3, d11);
    const d12 = new DependencyTreeNode<Package>(l1p2, topNode);
    const d22X = new DependencyTreeNode<Package>(l2p2, d12);
    const d31X = new DependencyTreeNode<Package>(l3p1, d22X);
    const d32X = new DependencyTreeNode<Package>(l3p2, d22X);

    expect(visitor.visit(d11)).toEqual(`+- ${l1p1.name}`);
    expect(visitor.visit(d21)).toEqual(`|  +- ${l2p1.name}`);
    expect(visitor.visit(d22)).toEqual(`|  +- ${l2p2.name}`);
    expect(visitor.visit(d31)).toEqual(`|  |  +- ${l3p1.name}`);
    expect(visitor.visit(d32)).toEqual(`|  |  \\- ${l3p2.name}`);
    expect(visitor.visit(d23)).toEqual(`|  \\- ${l2p3.name}`);
    expect(visitor.visit(d12)).toEqual(`\\- ${l1p2.name}`);
    expect(visitor.visit(d22X)).toEqual(`   \\- ${l2p2.name}`);
    expect(visitor.visit(d31X)).toEqual(`      +- ${l3p1.name}`);
    expect(visitor.visit(d32X)).toEqual(`      \\- ${l3p2.name}`);
});