# Code automatically generated - DO NOT EDIT.

import typing

import algopy as py
from algopy import subroutine, BigUInt, Bytes, arc4, UInt64, urange
from algopy.arc4 import UInt256, abimethod, DynamicArray, StaticArray, String
from algopy.op import sha256, EllipticCurve as ec, EC, bzero, setbit_bytes

Bytes32: typing.TypeAlias = StaticArray[arc4.Byte, typing.Literal[32]]


#################### Curve parameters #################

# curve order
R_MOD = 52435875175126190479447740508185965837690552500527637822603658699938581184513

# field order
P_MOD = 4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559787

#################### Trusted setup ####################

G2_SRS_0_X_0 = 3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758
G2_SRS_0_X_1 = 352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160
G2_SRS_0_Y_0 = 927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582
G2_SRS_0_Y_1 = 1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905

G2_SRS_1_X_0 = 1161317209249873512789247603712593347182542668085116614427785581525867550648783469657233168598885982772813308178553
G2_SRS_1_X_1 = 2792298311411421652790204167991182545757859712278550339660514572825306727107235493698939296289986712601543205094814
G2_SRS_1_Y_0 = 3372869106870331958209614733302413539808490657828262408575362915991428774746128598953265223087597531581803615856093
G2_SRS_1_Y_1 = 3330174647734167566668282111645276426209748328807476392727485929559898263679244269900924589567710255126816573009571

G1_SRS_X = 3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507
G1_SRS_Y = 1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569

######################################################


class Contract(py.ARC4Contract):
	@abimethod(create='require')
	def create(self, name: String) -> None:
		"""On creation, save application name in global state"""
		self.app_name = name
		self.immutable = False

	@abimethod(allow_actions=["UpdateApplication", "DeleteApplication"])
	def update(self) -> None:
		"""Creator can update and delete the application if the immutable
		   property is false."""
		assert not self.immutable
		assert py.Global.creator_address == py.Txn.sender

	@abimethod
	def make_immutable(self) -> None:
		"""Creator can make the contract immutable."""
		assert py.Global.creator_address == py.Txn.sender
		self.immutable = True

	@abimethod
	def verify(self,
	           proof: StaticArray[Bytes32, typing.Literal[35]],
			   public_inputs: StaticArray[Bytes32, typing.Literal[2]]
			   ) -> arc4.Bool:
		"""Verify the proof for the given public inputs.
		   Return a boolean indicating whether the proof is valid"""

		q = BigUInt(R_MOD)

		### Read verifying key ###
		VK_NB_PUBLIC_INPUTS = UInt64(2)
		VK_DOMAIN_SIZE = BigUInt(8)
		VK_INV_DOMAIN_SIZE = BigUInt(45881390778235416669516772944662720107979233437961683094778201362446258536449)
		VK_OMEGA = BigUInt(23674694431658770659612952115660802947967373701506253797663184111817857449850)

		VK_QL = Bytes.from_hex("10713fd94433520edf68824a133e0bea4d12a26167604bb153fb8f2167d9fcb81fab5f3b80f9bdd2e4788f9daf8d30ac08a797f6f70b8b9008032b7616555f3390aff3ee8df33a02b95262c73081de226e1460971be65302095d5651d1e9b2de")
		VK_QR = Bytes.from_hex("0c533a2bbb069ee54afde6ae8850761203d2fba9b65969e7fb81b945160125e2d1f2ab20ebbdf0a114b313b66ced354f0bdec437edf48274889d74a18af6c42555870c62a075d122af341e1f84c77747254fd05e9242813bb9499a9f3d862934")
		VK_QO = Bytes.from_hex("1154a1f3ede233572946ecb83254d7916eaf2339bbc7110a63e649d8a9c3439b889f94502bf591626ad0ba0f3eb7b19a135dc41b0a33449a0bc0ab4d468c00903f4e214fe48162aab811faaa4246f011bc55423ad13ad0b25ae103e10530395b")
		VK_QM = Bytes.from_hex("125f526b6b83faf0c0fe36ea278f6d62bfa767b059f4ac2f0ef3cba86999343ccac6b5e491e865000e7ded7dab271fce0fad77b55928de160418392b02029485a7ec5d53c8f3f5e93cb42aceac7ed7fe3e2459272208d45792a865b29f41a433")
		VK_QK = Bytes.from_hex("000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

		VK_S1 = Bytes.from_hex("17843c5e6efe68cfd49fc36e71a463d925ba95539e60a5fc08fa45df81806f368d51e703e7e564fa65253af6b8f8eafb1059292de9b05227c77e2f2ab05a461db144ef40d4f42781d403921242e8ea26d67eb8d9df4c2920d48845f027cc28e9")
		VK_S2 = Bytes.from_hex("01bcd4b305191c5f7c870f3b82b4f0b0cdc261b9c083bb77bf4a2ab81e7a8af1f558688d57aeedfb1b77f18f2ccd2d5b0e4fb14b661ff53851213e8c00620d2745247052252bebb12c34bf0d13fca3046be9f23803642fa21c0c2e96f4687e44")
		VK_S3 = Bytes.from_hex("1452d0f60241ecb67515ceff72123fe4738ed7b3dfafa71b07a5f68ad7a91424eb413e0b1d698304883e531dcaa0c69506ca24eb4a2662b3165f05224d563a8b707146774a0388b3efdde964da93f6959a3bce9cf4d187d923329822a9c236e8")
		
		VK_COSET_SHIFT = BigUInt(7)

		# Read the fiat-shamir values of the verifying key to match gnark's encoding of the point at infinity
		VK_QL_fs = Bytes.from_hex("10713fd94433520edf68824a133e0bea4d12a26167604bb153fb8f2167d9fcb81fab5f3b80f9bdd2e4788f9daf8d30ac08a797f6f70b8b9008032b7616555f3390aff3ee8df33a02b95262c73081de226e1460971be65302095d5651d1e9b2de")
		VK_QR_fs = Bytes.from_hex("0c533a2bbb069ee54afde6ae8850761203d2fba9b65969e7fb81b945160125e2d1f2ab20ebbdf0a114b313b66ced354f0bdec437edf48274889d74a18af6c42555870c62a075d122af341e1f84c77747254fd05e9242813bb9499a9f3d862934")
		VK_QO_fs = Bytes.from_hex("1154a1f3ede233572946ecb83254d7916eaf2339bbc7110a63e649d8a9c3439b889f94502bf591626ad0ba0f3eb7b19a135dc41b0a33449a0bc0ab4d468c00903f4e214fe48162aab811faaa4246f011bc55423ad13ad0b25ae103e10530395b")
		VK_QM_fs = Bytes.from_hex("125f526b6b83faf0c0fe36ea278f6d62bfa767b059f4ac2f0ef3cba86999343ccac6b5e491e865000e7ded7dab271fce0fad77b55928de160418392b02029485a7ec5d53c8f3f5e93cb42aceac7ed7fe3e2459272208d45792a865b29f41a433")
		VK_QK_fs = Bytes.from_hex("400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")
		
		VK_S1_fs = Bytes.from_hex("17843c5e6efe68cfd49fc36e71a463d925ba95539e60a5fc08fa45df81806f368d51e703e7e564fa65253af6b8f8eafb1059292de9b05227c77e2f2ab05a461db144ef40d4f42781d403921242e8ea26d67eb8d9df4c2920d48845f027cc28e9")
		
		VK_S2_fs = Bytes.from_hex("01bcd4b305191c5f7c870f3b82b4f0b0cdc261b9c083bb77bf4a2ab81e7a8af1f558688d57aeedfb1b77f18f2ccd2d5b0e4fb14b661ff53851213e8c00620d2745247052252bebb12c34bf0d13fca3046be9f23803642fa21c0c2e96f4687e44")
		
		VK_S3_fs = Bytes.from_hex("1452d0f60241ecb67515ceff72123fe4738ed7b3dfafa71b07a5f68ad7a91424eb413e0b1d698304883e531dcaa0c69506ca24eb4a2662b3165f05224d563a8b707146774a0388b3efdde964da93f6959a3bce9cf4d187d923329822a9c236e8")
		

		### Read proof ###
		# wires commitments
		L_COM = proof[0].bytes + proof[1].bytes + proof[2].bytes
		R_COM = proof[3].bytes + proof[4].bytes + proof[5].bytes
		O_COM = proof[6].bytes + proof[7].bytes + proof[8].bytes

		# h = h_0 + x^{n+2}h_1 + x^{2(n+2)}h_
		H0 = proof[9].bytes + proof[10].bytes + proof[11].bytes
		H1 = proof[12].bytes + proof[13].bytes + proof[14].bytes
		H2 = proof[15].bytes + proof[16].bytes + proof[17].bytes

		# wire values at zeta
		L_AT_Z = proof[18].copy()
		R_AT_Z = proof[19].copy()
		O_AT_Z = proof[20].copy()

		S1_AT_Z = proof[21].copy() 						  # s1(zeta)
		S2_AT_Z = proof[22].copy() 						  # s2(zeta)

		# z(x)
		GRAND_PRODUCT = proof[23].bytes + proof[24].bytes + proof[25].bytes
		GRAND_PRODUCT_AT_Z_OMEGA = proof[26].copy()       # z(w*zeta)
		QUOTIENT_POLY_AT_Z = proof[27].copy()             # t(zeta)
		LINEAR_POLY_AT_Z = proof[28].copy()               # r(zeta)

		# Folded proof for opening of H, linear poly, l, r, o, s1, s2, qc
		BATCH_OPENING_AT_Z = proof[29].bytes + proof[30].bytes + proof[31].bytes
		OPENING_AT_Z_OMEGA = proof[32].bytes + proof[33].bytes + proof[34].bytes

		### check proof public inputs are well-formed ###
		if (BigUInt.from_bytes(L_AT_Z.bytes) >= q
				or BigUInt.from_bytes(R_AT_Z.bytes) >= q
				or BigUInt.from_bytes(O_AT_Z.bytes) >= q
				or BigUInt.from_bytes(S1_AT_Z.bytes) >= q
				or BigUInt.from_bytes(S2_AT_Z.bytes) >= q
				or BigUInt.from_bytes(GRAND_PRODUCT_AT_Z_OMEGA.bytes) >= q
				or BigUInt.from_bytes(QUOTIENT_POLY_AT_Z.bytes) >= q
				or BigUInt.from_bytes(LINEAR_POLY_AT_Z.bytes) >= q):
			return arc4.Bool(False)

		for i in urange(public_inputs.length):
			if BigUInt.from_bytes(public_inputs[i].bytes) >= q:
				return arc4.Bool(False)

		### Verify the proof ###

		# Compute the fiat-shamir challenges as the prover (gnark).
		# After deriving all challenges, we need to make them modulo R_MOD.

		public_inputs_bytes = Bytes(b'')
		for i in urange(public_inputs.length):
			public_inputs_bytes += public_inputs[i].bytes

		gamma_pre = sha256(b'gamma' + VK_S1_fs + VK_S2_fs + VK_S3_fs + VK_QL_fs
					+ VK_QR_fs + VK_QM_fs + VK_QO_fs + VK_QK_fs + public_inputs_bytes
					+ fs(L_COM) + fs(R_COM) + fs(O_COM))
		beta_pre = sha256(b'beta' + gamma_pre)
		alpha_pre = sha256(b'alpha' + beta_pre + fs(GRAND_PRODUCT))
		zeta_pre = sha256(b'zeta' + alpha_pre + fs(H0) + fs(H1) + fs(H2))

		gamma = curvemod(gamma_pre)
		beta = curvemod(beta_pre)
		alpha = curvemod(alpha_pre)
		zeta = curvemod(zeta_pre)

		# Zz is eval of Xⁿ-1 at zeta
		Zz = (expmod(zeta, VK_DOMAIN_SIZE, q) + q - BigUInt(1)) % q

		# zn is Zz * 1/n
		zn = (Zz * VK_INV_DOMAIN_SIZE) % q

		# Let's prepare to interpolate the public inputs
		w_ = BigUInt(1)
		batch = DynamicArray[UInt256]()
		for i in urange(VK_NB_PUBLIC_INPUTS):
			x = (zeta + q - w_) % q
			batch.append(UInt256(x))
			w_ = (w_ * VK_OMEGA) % q

		# Compute batch inversion
		temp = DynamicArray[UInt256]()
		prev = BigUInt(1)
		temp.append(UInt256(prev))
		for x256 in batch:
			x = BigUInt.from_bytes(x256.bytes)
			y = (x * prev) % q
			temp.append(UInt256(y))
			prev = y
		inv = expmod(prev, q - BigUInt(2), q)
		i = VK_NB_PUBLIC_INPUTS
		while i > 0:
			tmp = BigUInt.from_bytes(batch[i-1].bytes)
			cur = (inv * BigUInt.from_bytes(temp[i-1].bytes)) % q
			batch[i-1] = UInt256(cur)
			inv = (inv * tmp) % q
			i -= 1

		# We can now interpolate the public inputs (PI)
		w_ = BigUInt(1)
		for i in urange(VK_NB_PUBLIC_INPUTS):
			batch[i] = UInt256((w_ * ((BigUInt.from_bytes(batch[i].bytes) * zn)
								% q)) % q)
			w_ = (w_ * VK_OMEGA) % q

		tmp = BigUInt(0)
		PI = BigUInt(0)
		for i in urange(VK_NB_PUBLIC_INPUTS):
			tmp = (BigUInt.from_bytes(batch[i].bytes)
				   * BigUInt.from_bytes(public_inputs[i].bytes)) % q
			PI = (PI + tmp) % q

		# compute alpha2Lagrange: alpha**2 * (z**n - 1) / (z - 1)
		res = (zeta + q - BigUInt(1)) % q
		res = expmod(res, q - BigUInt(2), q)
		res = (res * zn) % q
		res = (res * alpha) % q
		res = (res * alpha) % q
		alpha2Lagrange = res

		# verify quotient polynomial evaluation at zeta
		s1 = (BigUInt.from_bytes(S1_AT_Z.bytes) * beta) % q
		s1 = (s1 + gamma + BigUInt.from_bytes(L_AT_Z.bytes)) % q

		s2 = (BigUInt.from_bytes(S2_AT_Z.bytes) * beta) % q
		s2 = (s2 + gamma + BigUInt.from_bytes(R_AT_Z.bytes)) % q

		o = (BigUInt.from_bytes(O_AT_Z.bytes) + gamma) % q

		s1 = (s1 * s2) % q
		s1 = (s1 * o) % q
		s1 = (s1 * alpha) % q
		s1 = (s1 * BigUInt.from_bytes(GRAND_PRODUCT_AT_Z_OMEGA.bytes)) % q

		quot = (BigUInt.from_bytes(LINEAR_POLY_AT_Z.bytes) + PI + s1 + q
								   - alpha2Lagrange) % q

		s2 = (BigUInt.from_bytes(QUOTIENT_POLY_AT_Z.bytes) * Zz) % q

		if quot != s2:
			return arc4.Bool(False)

		# compute the folded commitment to H
		n2 = VK_DOMAIN_SIZE + BigUInt(2)
		zn2 = expmod(zeta, n2, q)
		folded_h = ec.scalar_mul(EC.BLS12_381g1, H2, zn2.bytes)
		folded_h = ec.add(EC.BLS12_381g1, folded_h, H1)
		folded_h = ec.scalar_mul(EC.BLS12_381g1, folded_h, zn2.bytes)
		folded_h = ec.add(EC.BLS12_381g1, folded_h, H0)

		# compute commitment to linearization polynomial
		u = (BigUInt.from_bytes(GRAND_PRODUCT_AT_Z_OMEGA.bytes) * beta) % q
		v = (BigUInt.from_bytes(S1_AT_Z.bytes) * beta) % q
		v = (v + BigUInt.from_bytes(L_AT_Z.bytes) + gamma) % q
		w  = (BigUInt.from_bytes(S2_AT_Z.bytes) * beta) % q
		w = (w + BigUInt.from_bytes(R_AT_Z.bytes) + gamma) % q

		s1 = (u * v) % q
		s1 = (s1 * w) % q
		s1 = (s1 * alpha) % q

		coset_square = (VK_COSET_SHIFT * VK_COSET_SHIFT) % q
		betazeta = (beta * zeta) % q
		u = (betazeta + BigUInt.from_bytes(L_AT_Z.bytes) + gamma) % q

		v = (betazeta * VK_COSET_SHIFT) % q
		v = (v + BigUInt.from_bytes(R_AT_Z.bytes) + gamma) % q

		w = (betazeta * coset_square) % q
		w = (w + BigUInt.from_bytes(O_AT_Z.bytes) + gamma) % q

		s2 = (u * v) % q
		s2 = q - ((s2 * w) % q)
		s2 = (s2 * alpha + alpha2Lagrange) % q

		lin_poly_com = ec.scalar_mul(EC.BLS12_381g1, VK_QL, L_AT_Z.bytes)

		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_QR, R_AT_Z.bytes)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, add_term)

		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_QO, O_AT_Z.bytes)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, add_term)

		ab = (BigUInt.from_bytes(L_AT_Z.bytes) * BigUInt.from_bytes(R_AT_Z.bytes)) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_QM, ab.bytes)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, add_term)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, VK_QK)

		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_S3, s1.bytes)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, add_term)

		add_term = ec.scalar_mul(EC.BLS12_381g1, GRAND_PRODUCT, s2.bytes)
		lin_poly_com = ec.add(EC.BLS12_381g1, lin_poly_com, add_term)

		# generate challenge to fold the opening proofs
		r_pre = sha256(b'gamma' + UInt256(zeta).bytes + folded_h + lin_poly_com
			 + fs(L_COM) + fs(R_COM) + fs(O_COM) + VK_S1_fs + VK_S2_fs + QUOTIENT_POLY_AT_Z.bytes
			 + LINEAR_POLY_AT_Z.bytes + L_AT_Z.bytes + R_AT_Z.bytes
			 + O_AT_Z.bytes + S1_AT_Z.bytes + S2_AT_Z.bytes
			 + GRAND_PRODUCT_AT_Z_OMEGA.bytes)
		r = curvemod(r_pre)
		r_acc = r

		# fold the proof in one point
		digest = folded_h
		add_term = ec.scalar_mul(EC.BLS12_381g1, lin_poly_com, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (BigUInt.from_bytes(QUOTIENT_POLY_AT_Z.bytes)
				  + (BigUInt.from_bytes(LINEAR_POLY_AT_Z.bytes) * r_acc)
				 ) % q

		r_acc = (r_acc * r) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, L_COM, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (claims + (BigUInt.from_bytes(L_AT_Z.bytes) * r_acc)) % q

		r_acc = (r_acc * r) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, R_COM, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (claims + (BigUInt.from_bytes(R_AT_Z.bytes) * r_acc)) % q

		r_acc = (r_acc * r) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, O_COM, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (claims + (BigUInt.from_bytes(O_AT_Z.bytes) * r_acc)) % q

		r_acc = (r_acc * r) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_S1, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (claims + (BigUInt.from_bytes(S1_AT_Z.bytes) * r_acc)) % q

		r_acc = (r_acc * r) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, VK_S2, r_acc.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)
		claims = (claims + (BigUInt.from_bytes(S2_AT_Z.bytes) * r_acc)) % q

		# verify the folded proof
		r_pre = sha256(digest + BATCH_OPENING_AT_Z + fs(GRAND_PRODUCT)
				+ OPENING_AT_Z_OMEGA + UInt256(zeta).bytes + UInt256(r).bytes)
		r = curvemod(r_pre)

		quotient = BATCH_OPENING_AT_Z
		add_term = ec.scalar_mul(EC.BLS12_381g1, OPENING_AT_Z_OMEGA, r.bytes)
		quotient = ec.add(EC.BLS12_381g1, quotient, add_term)

		add_term = ec.scalar_mul(EC.BLS12_381g1, GRAND_PRODUCT, r.bytes)
		digest = ec.add(EC.BLS12_381g1, digest, add_term)

		claims = (claims + (BigUInt.from_bytes(GRAND_PRODUCT_AT_Z_OMEGA.bytes)
	       		  * r)) % q
		G1_SRS = (bzero(48) | BigUInt(G1_SRS_X).bytes) + (bzero(48) | BigUInt(G1_SRS_Y).bytes)
		claims_com = ec.scalar_mul(EC.BLS12_381g1, G1_SRS, claims.bytes)

		digest = ec.add(EC.BLS12_381g1, digest, invert(claims_com))

		points_quotient = ec.scalar_mul(EC.BLS12_381g1, BATCH_OPENING_AT_Z, zeta.bytes)

		zeta_omega = (zeta * VK_OMEGA) % q
		r = (r * zeta_omega) % q
		add_term = ec.scalar_mul(EC.BLS12_381g1, OPENING_AT_Z_OMEGA, r.bytes)
		points_quotient = ec.add(EC.BLS12_381g1, points_quotient, add_term)

		digest = ec.add(EC.BLS12_381g1, digest, points_quotient)
		quotient = invert(quotient)

		g2 = ((bzero(48) | BigUInt(G2_SRS_0_X_1).bytes) + (bzero(48) | BigUInt(G2_SRS_0_X_0).bytes)
		+ (bzero(48) | BigUInt(G2_SRS_0_Y_1).bytes) + (bzero(48) | BigUInt(G2_SRS_0_Y_0).bytes)
		+ (bzero(48) | BigUInt(G2_SRS_1_X_1).bytes) + (bzero(48) | BigUInt(G2_SRS_1_X_0).bytes)
		+ (bzero(48) | BigUInt(G2_SRS_1_Y_1).bytes) + (bzero(48) | BigUInt(G2_SRS_1_Y_0).bytes))

		check = ec.pairing_check(EC.BLS12_381g1, digest + quotient, g2)
		return arc4.Bool(check)



@subroutine
def expmod(base: BigUInt, exponent: BigUInt, modulus: BigUInt) -> BigUInt:
	"""Compute base^exponent % modulus."""
	result = BigUInt(1)
	while exponent > 0:
		if exponent % 2 == 1:
			result = (result * base) % modulus
		exponent = exponent // 2
		base = (base * base) % modulus
	return result

@subroutine
def curvemod(x: Bytes) -> BigUInt:
	"""Compute x % R_MOD."""
	return BigUInt.from_bytes(x) % BigUInt(R_MOD)

@subroutine
def invert(p : Bytes) -> Bytes:
	"""Invert a point on the curve."""
	x = BigUInt.from_bytes(p[:48])
	y = BigUInt.from_bytes(p[48:])
	neg_y = BigUInt(P_MOD) - y
	return x.bytes + (bzero(48) | (neg_y).bytes)

@subroutine
def fs(p: Bytes) -> Bytes:
	"""If p is the point at infinity, mask the first bit with 1
	to match gnark's encoding for the fiat-shamir challenge."""
	if p == bzero(96):
		return setbit_bytes(p, 0, 1)
	return p
