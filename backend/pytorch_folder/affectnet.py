from torch import nn

# defining the model
class AffectNet(nn.Module):
    def __init__(self, input_shape: int):
        super().__init__()
        self.conv_block_1 = nn.Sequential(
            nn.Conv2d(in_channels=input_shape, # creating a conv layer. unlike linear layers, deals with nested tensor rather than flattened
                      out_channels=32,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.Conv2d(in_channels=32, # another conv layer. these layers get the 'features' of the classes
                      out_channels=64,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25),
        )
        self.conv_block_2 = nn.Sequential(
            nn.Conv2d(in_channels=64,
                      out_channels=128,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.Conv2d(in_channels=128,
                      out_channels=128,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25)
        )
        self.conv_block_3 = nn.Sequential(
            nn.Conv2d(in_channels=128,
                      out_channels=256,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.Conv2d(in_channels=256,
                      out_channels=256,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25)
        )
        self.classifer = nn.Sequential( # classifier is the final linear layer to convert tensor into output
            nn.Flatten(),
            nn.Linear(in_features=256*12*12,
                      out_features=256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.5),
            nn.Linear(in_features=256,
                      out_features=8)
        )
    def forward(self, x):
        x = self.conv_block_1(x)
        # print(f"Output shape of conv_block_1 is: {x.shape}")
        x = self.conv_block_2(x)
        # print(f"Output shape of conv_block_2 is: {x.shape}")
        x = self.conv_block_3(x)
        # print(f"Output shape of conv_block_3 is: {x.shape}")
        logits = self.classifer(x)
        return logits