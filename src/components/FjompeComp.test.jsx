import {TestContext} from "../testTools/TestContext";
import React, {useState} from "react";
import {FjompeComp} from "./FjompeComp";

const context = new TestContext();
context.setupBeforeAfter();
describe('Split hooks fra component', () => {
  it('works ??', () => {
    const result = context.renderHook(useState, 'flesk');
    console.log(result);
    const [fjomp, setFjomp] = [result[0], result[1]];
    console.log(fjomp, setFjomp);
    context.render(<FjompeComp fjomp={fjomp} setFjomp={setFjomp} />);
    const element = context.testRenderer.root.findByProps({'data-testid': 'fjompen'});
    expect(element.props.children).toEqual('flesk');
    context.act(() => setFjomp('fllips'));
  });
});