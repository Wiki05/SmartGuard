import torch
from transformers import AutoTokenizer, RobertaConfig, RobertaForSequenceClassification

device = torch.device('cpu')
TOKENIZER_PATH = 'model/smartguard_tokenizer'
MODEL_PATH = 'model/smartguard_best_model.pt'

tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)
config = RobertaConfig.from_pretrained('microsoft/graphcodebert-base', num_labels=2)
model = RobertaForSequenceClassification(config)

state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict, strict=False)
model.to(device)
model.eval()

tests = [
    """
    pragma solidity ^0.8.0;
    contract SafeStorage {
        uint256 public value;
        function set(uint256 _value) public { value = _value; }
        function get() public view returns (uint256) { return value; }
    }
    """,
    """
    pragma solidity ^0.8.0;
    contract VulnerableBank {
        mapping(address => uint256) public balances;
        function deposit() public payable { balances[msg.sender] += msg.value; }
        function withdraw(uint256 amount) public {
            require(balances[msg.sender] >= amount);
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success);
            balances[msg.sender] -= amount;
        }
    }
    """
]

print("Model Testing...")
with torch.no_grad():
    for i, code in enumerate(tests):
        inputs = tokenizer(code, return_tensors="pt", truncation=True, padding=True, max_length=512)
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        pred = torch.argmax(probs, dim=-1).item()
        conf = float(probs[0][pred].item())
        print(f"Test {i+1}: Pred={pred} (0=Safe,1=Vuln), Conf={conf:.4f}")
