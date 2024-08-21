from opshin.prelude import *
@dataclass()
class WithdrawDatum(PlutusData):
    pubkeyhash: bytes


def validator(datum: WithdrawDatum, redeemer: None, context: ScriptContext) -> None:
    context.tx_info.mint
    sig_present = False
    for s in context.tx_info.signatories:
        if datum.pubkeyhash == s:
            sig_present = True
    assert sig_present, "Required signature missing"
