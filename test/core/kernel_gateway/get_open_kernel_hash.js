// Copyright 2018 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

const web3 = require('../../test_lib/web3.js');
const BN = require('bn.js');
const KernelGateway = artifacts.require('TestKernelGateway');
const BlockStoreMock = artifacts.require('BlockStoreMock');

contract('KernelGateway.getOpenKernelHash()', async (accounts) => {

  const zeroBytes =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  let kernelGateway, originBlockStore, auxiliaryBlockStore, initialKernelHash;

  beforeEach(async function() {

    originBlockStore = await BlockStoreMock.new();
    auxiliaryBlockStore = await BlockStoreMock.new();

    initialKernelHash = web3.utils.sha3('kernelHash');

    kernelGateway = await KernelGateway.new(
      accounts[1],
      originBlockStore.address,
      auxiliaryBlockStore.address,
      initialKernelHash,
    );

    await auxiliaryBlockStore.setKernelGateway(kernelGateway.address);

  });

  it('should return zero hash when height is not the activation ' +
    'kernel hash', async () => {

    let openKernelHash = await kernelGateway.getOpenKernelHash.call(2);

    assert.strictEqual(
      openKernelHash,
      zeroBytes,
      `Open kernel hash must be zero.`,
    );

  });

  it('should return correct hash when height is the activation ' +
    'kernel hash and open kernel exists', async () => {

    let hash =
      "0xb6a85955e3671040901a17db85b121550338ad1a0071ca13d196d19df31f56ca";

    let activationHeight = new BN(1234);

    await kernelGateway.setOpenKernelHash(hash);
    await kernelGateway.setOpenKernelActivationHeight(activationHeight);

    let openKernelHash = await kernelGateway.getOpenKernelHash.call(activationHeight);

    assert.strictEqual(
      openKernelHash,
      hash,
      `Open kernel hash must be ${hash}.`,
    );

  });

  it('should return zero hash for the activation height once the kernel ' +
      'hash is activated', async () => {

    let hash =
      "0xb6a85955e3671040901a17db85b121550338ad1a0071ca13d196d19df31f56ca";

    let activationHeight = new BN(1234);

    await kernelGateway.setOpenKernelHash(hash);
    await kernelGateway.setOpenKernelActivationHeight(activationHeight);

    let openKernelHash = await kernelGateway.getOpenKernelHash.call(activationHeight);

    assert.strictEqual(
      openKernelHash,
      hash,
      `Open kernel hash must be ${hash}.`,
    );

    await auxiliaryBlockStore.activateKernel(hash);

    openKernelHash = await kernelGateway.getOpenKernelHash.call(activationHeight);

    assert.strictEqual(
      openKernelHash,
      zeroBytes,
      `Open kernel hash must be zero.`,
    );

  });

});
